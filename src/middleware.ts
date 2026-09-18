import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/queue(.*)',
  '/inbox(.*)',
  '/portals(.*)',
  '/sentinel(.*)',
  '/carrier-audit(.*)',
  '/shadow-audit(.*)',
  '/settings(.*)',
  '/investigations(.*)',
]);

const isCiE2EMode =
  process.env.CARGOIQ_E2E_MODE === 'true' &&
  process.env.VERCEL !== '1';

const handler = isCiE2EMode
  ? (_request: Request) => NextResponse.next()
  : clerkMiddleware(async (auth, req) => {
      if (isProtected(req)) await auth.protect();
    });

export default handler;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
