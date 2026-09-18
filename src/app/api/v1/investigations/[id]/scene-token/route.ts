import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getInvestigationCase, getTenantContext } from "@/modules/investigation/service";
import { createSceneToken } from "@/modules/investigation/scene-token";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const tenant = await getTenantContext(userId);
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 403 });

  const { id } = await context.params;
  if (!(await getInvestigationCase(tenant.id, id))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  try {
    return NextResponse.json({
      token: createSceneToken(id, tenant.id),
      expiresInSeconds: 900,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SCENE_TOKEN_FAILED";
    return NextResponse.json({ error: "SCENE_TOKEN_FAILED", message }, { status: 503 });
  }
}
