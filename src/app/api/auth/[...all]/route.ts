import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function notReady() {
  return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Auth not configured." }, { status: 503 });
}

export async function GET(request: NextRequest) {
  if (!auth) return notReady();
  return auth.handler(request);
}

export async function POST(request: NextRequest) {
  if (!auth) return notReady();
  return auth.handler(request);
}

export async function PUT(request: NextRequest) {
  if (!auth) return notReady();
  return auth.handler(request);
}

export async function DELETE(request: NextRequest) {
  if (!auth) return notReady();
  return auth.handler(request);
}
