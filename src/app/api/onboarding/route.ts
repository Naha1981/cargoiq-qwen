import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'Onboarding has been removed. Workspace setup happens automatically on sign-in.' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { message: 'Onboarding has been removed. Workspace setup happens automatically on sign-in.' },
    { status: 410 }
  );
}