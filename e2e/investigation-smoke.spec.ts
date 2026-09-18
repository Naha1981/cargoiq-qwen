import { test, expect } from "@playwright/test";

type ReviewState = {
  claims: Array<{
    id: string;
    claimType: string;
    claimText: string;
    value: string;
    pageNumber: number;
    sourceQuote: string;
    provenance: string;
    humanReviewed: boolean;
  }>;
  contradictions: Array<{
    id: string;
    contradictionType: string;
    explanation: string;
    severity: string;
    resolved: boolean;
  }>;
  latestPack: {
    id: string;
    status: string;
    version: string;
    contentHash: string | null;
  } | null;
  reviewSummary: {
    totalClaims: number;
    verifiedClaims: number;
    pendingClaims: number;
    unresolvedContradictions: number;
  };
};

test.describe("Investigation smoke", () => {
  test("investigation workspace supports create -> open -> review -> approve flow", async ({ page }) => {
    const caseId = "browser-case";
    let created = false;

    const review: ReviewState = {
      claims: [
        {
          id: "claim-1",
          claimType: "ARRIVAL_TIME",
          claimText: "Container arrived at the terminal.",
          value: "2026-08-01T08:00:00Z",
          pageNumber: 1,
          sourceQuote: "Arrived 01 Aug 2026 08:00",
          provenance: "DERIVED",
          humanReviewed: false,
        },
      ],
      contradictions: [
        {
          id: "contradiction-1",
          contradictionType: "TIMELINE_CONFLICT",
          explanation: "Arrival and availability timestamps conflict.",
          severity: "HIGH",
          resolved: false,
        },
      ],
      latestPack: {
        id: "pack-1",
        status: "GENERATED",
        version: "1",
        contentHash: "test-hash",
      },
      reviewSummary: {
        totalClaims: 1,
        verifiedClaims: 0,
        pendingClaims: 1,
        unresolvedContradictions: 1,
      },
    };

    await page.route("**/api/v1/investigations", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: created
              ? [
                  {
                    id: caseId,
                    title: "Browser demurrage case",
                    reference: null,
                    disputeType: "DEMURRAGE",
                    status: "OPEN",
                    baseCurrency: "ZAR",
                    updatedAt: "2026-09-18T00:00:00.000Z",
                  },
                ]
              : [],
          }),
        });
      }

      if (route.request().method() === "POST") {
        created = true;
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              id: caseId,
              title: "Browser demurrage case",
              reference: null,
              disputeType: "DEMURRAGE",
              status: "OPEN",
              baseCurrency: "ZAR",
              notes: null,
            },
          }),
        });
      }

      return route.continue();
    });

    await page.route("**/api/v1/investigations/browser-case**", async (route) => {
      const path = new URL(route.request().url()).pathname;

      if (path === "/api/v1/investigations/browser-case" && route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              id: caseId,
              title: "Browser demurrage case",
              reference: null,
              disputeType: "DEMURRAGE",
              status: "OPEN",
              baseCurrency: "ZAR",
              notes: null,
            },
          }),
        });
      }

      if (path.endsWith("/geospatial")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ entities: [] }),
        });
      }

      if (path.endsWith("/review")) {
        if (route.request().method() === "GET") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: review }),
          });
        }

        const payload = JSON.parse(route.request().postData() ?? "{}") as {
          action?: string;
          claimId?: string;
          contradictionId?: string;
        };

        if (payload.action === "VERIFY_CLAIM" && payload.claimId === "claim-1") {
          review.claims[0].provenance = "VERIFIED";
          review.claims[0].humanReviewed = true;
          review.reviewSummary.verifiedClaims = 1;
          review.reviewSummary.pendingClaims = 0;
        }

        if (payload.action === "RESOLVE_CONTRADICTION" && payload.contradictionId === "contradiction-1") {
          review.contradictions[0].resolved = true;
          review.reviewSummary.unresolvedContradictions = 0;
        }

        if (payload.action === "APPROVE_EVIDENCE_PACK") {
          review.latestPack!.status = "APPROVED";
        }

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { recorded: true } }),
        });
      }

      return route.continue();
    });

    await page.goto("/investigations");
    await expect(page.getByRole("heading", { name: "Investigate the money." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "New investigation" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cases" })).toBeVisible();

    const titleInput = page.getByLabel("Case title");
    await titleInput.fill("Browser demurrage case");
    await page.getByLabel("Dispute type").selectOption("DEMURRAGE");
    const createButton = page.getByRole("button", { name: "Create investigation" });
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page.getByRole("link", { name: "Browser demurrage case" })).toBeVisible();
    await page.getByRole("link", { name: "Browser demurrage case" }).click();

    await expect(page.getByRole("heading", { name: "Browser demurrage case" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Human review" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark resolved" })).toBeVisible();

    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByText("Review action recorded in the investigation audit trail.")).toBeVisible();

    await page.getByRole("button", { name: "Mark resolved" }).click();
    await expect(page.getByText("0 conflicts")).toBeVisible();

    const approveButton = page.getByRole("button", { name: "Approve pack" });
    await expect(approveButton).toBeEnabled();
    await approveButton.click();

    await expect(page.getByRole("button", { name: "Pack approved" })).toBeVisible();
  });

  test("health endpoint is reachable from the browser", async ({ page }) => {
    const response = await page.request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("cargoiq");
  });
});
