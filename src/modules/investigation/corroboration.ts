import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  externalObservations,
  externalSources,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";

const AIS_URL = "wss://stream.aisstream.io/v0/stream";
const SENTINEL_STAC_URL = "https://stac.dataspace.copernicus.eu/v1/search";

export interface CorroborationInput {
  vesselName?: string;
  bbox: [number, number, number, number];
  start: string;
  end: string;
}

async function ensureSource(input: {
  name: string;
  sourceType: string;
  officialUrl: string;
  licenseName: string;
  commercialUseStatus: string;
  attributionRequired: boolean;
}) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  const [existing] = await db
    .select()
    .from(externalSources)
    .where(eq(externalSources.name, input.name))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(externalSources)
    .values({
      id: generateId(),
      name: input.name,
      sourceType: input.sourceType,
      officialUrl: input.officialUrl,
      licenseName: input.licenseName,
      commercialUseStatus: input.commercialUseStatus,
      attributionRequired: input.attributionRequired,
      retentionNotes: "Review source-specific retention terms before production rollout.",
      redistributionNotes: "Do not redistribute upstream data beyond applicable terms.",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return created;
}

function normalizeBbox(bbox: [number, number, number, number]) {
  const [west, south, east, north] = bbox;
  if (
    ![west, south, east, north].every(Number.isFinite) ||
    west < -180 || east > 180 || south < -90 || north > 90 ||
    west >= east || south >= north
  ) throw new Error("INVALID_BBOX");
  return bbox;
}

async function aisObserve(vesselName: string | undefined, bbox: [number, number, number, number], timeoutMs = 8000) {
  const apiKey = process.env.AISSTREAM_API_KEY;
  if (!apiKey) return [];

  const [west, south, east, north] = normalizeBbox(bbox);
  const lowerName = vesselName?.trim().toLowerCase();
  const events: Array<Record<string, unknown>> = [];

  await new Promise<void>((resolve) => {
    const socket = new WebSocket(AIS_URL);
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      try { socket.close(); } catch {}
      resolve();
    };
    const timer = setTimeout(finish, timeoutMs);

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({
        APIKey: apiKey,
        BoundingBoxes: [[[south, west], [north, east]]],
        FilterMessageTypes: ["PositionReport", "ShipStaticData", "StaticDataReport"],
      }));
    });
    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(String(event.data));
        const meta = payload?.MetaData;
        const name = typeof meta?.ShipName === "string" ? meta.ShipName.trim() : "";
        if (lowerName && !name.toLowerCase().includes(lowerName)) return;
        if (!meta?.Latitude || !meta?.Longitude) return;
        events.push({
          mmsi: meta?.MMSI ?? null,
          shipName: name || null,
          latitude: meta.Latitude,
          longitude: meta.Longitude,
          messageType: payload?.MessageType ?? null,
          observedAt: new Date().toISOString(),
          message: payload?.Message ?? null,
        });
        if (events.length >= 25) finish();
      } catch {}
    });
    socket.addEventListener("error", finish);
    socket.addEventListener("close", () => {
      clearTimeout(timer);
      resolve();
    });
  });

  return events;
}

async function sentinelDiscover(
  bbox: [number, number, number, number],
  start: string,
  end: string,
) {
  const [west, south, east, north] = normalizeBbox(bbox);
  const response = await fetch(SENTINEL_STAC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      collections: ["sentinel-1-grd"],
      bbox: [west, south, east, north],
      datetime: `${new Date(start).toISOString()}/${new Date(end).toISOString()}`,
      limit: 10,
      sortby: [{ field: "datetime", direction: "asc" }],
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`SENTINEL_STAC_${response.status}`);
  const body = (await response.json()) as { features?: Array<any> };
  return body.features ?? [];
}

export async function runCorroboration(
  tenantId: string,
  caseId: string,
  input: CorroborationInput,
) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const aisSource = await ensureSource({
    name: "AISStream",
    sourceType: "AIS",
    officialUrl: "https://aisstream.io/documentation",
    licenseName: "Provider terms / account terms — review before commercial production",
    commercialUseStatus: "REVIEW",
    attributionRequired: true,
  });
  const sentinelSource = await ensureSource({
    name: "Copernicus Sentinel Data Space",
    sourceType: "SATELLITE",
    officialUrl: "https://dataspace.copernicus.eu/terms-and-conditions",
    licenseName: "Copernicus Sentinel Data Legal Notice",
    commercialUseStatus: "APPROVED_FOR_REVIEW",
    attributionRequired: true,
  });

  const [aisRows, sentinelRows] = await Promise.all([
    aisObserve(input.vesselName, input.bbox),
    sentinelDiscover(input.bbox, input.start, input.end),
  ]);

  const created = [];

  for (const row of aisRows) {
    const [inserted] = await db
      .insert(externalObservations)
      .values({
        id: generateId(),
        tenantId,
        caseId,
        sourceId: aisSource.id,
        observationType: "AIS_POSITION",
        observedAt: new Date(String(row.observedAt)),
        retrievedAt: new Date(),
        latitude: String(row.latitude),
        longitude: String(row.longitude),
        provenance: "INDEPENDENT_OBSERVATION",
        confidence: "0.8000",
        payload: row,
        limitation: "AIS observation can corroborate vessel presence/position; it does not prove a container's availability, responsibility or contractual entitlement.",
        createdAt: new Date(),
      })
      .returning();
    created.push(inserted);
  }

  for (const item of sentinelRows) {
    const geometry = item?.geometry;
    const bbox = Array.isArray(item?.bbox) && item.bbox.length === 4 ? item.bbox : null;
    const coordinates = Array.isArray(geometry?.coordinates)
      ? geometry.coordinates
      : [];
    const lon = bbox ? (Number(bbox[0]) + Number(bbox[2])) / 2 : Number(coordinates[0]?.[0] ?? 0);
    const lat = bbox ? (Number(bbox[1]) + Number(bbox[3])) / 2 : Number(coordinates[0]?.[1] ?? 0);

    const [inserted] = await db
      .insert(externalObservations)
      .values({
        id: generateId(),
        tenantId,
        caseId,
        sourceId: sentinelSource.id,
        observationType: "SENTINEL_SCENE",
        observedAt: item?.properties?.datetime ? new Date(item.properties.datetime) : null,
        retrievedAt: new Date(),
        latitude: Number.isFinite(lat) ? String(lat) : null,
        longitude: Number.isFinite(lon) ? String(lon) : null,
        provenance: "INDEPENDENT_OBSERVATION",
        confidence: "0.7000",
        payload: {
          id: item?.id ?? null,
          collection: item?.collection ?? null,
          datetime: item?.properties?.datetime ?? null,
          cloudCover: item?.properties?.["eo:cloud_cover"] ?? null,
          assets: item?.assets ? Object.keys(item.assets) : [],
        },
        limitation: "Sentinel scene metadata establishes that an EO scene covers the area/time; scene availability alone does not prove container movement, cargo availability or liability.",
        createdAt: new Date(),
      })
      .returning();
    created.push(inserted);
  }

  return {
    sources: {
      ais: aisSource,
      sentinel: sentinelSource,
    },
    counts: {
      ais: aisRows.length,
      sentinel: sentinelRows.length,
      total: created.length,
    },
  };
}
