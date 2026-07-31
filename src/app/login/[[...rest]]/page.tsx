'use client';

import { SignIn } from '@clerk/nextjs';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center px-4">
      {/* CIVIC: "Cargo" renders near-black on the white page; "IQ" always uses the ember gradient */}
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
