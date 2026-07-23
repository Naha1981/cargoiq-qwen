'use client';

import { SignIn } from '@clerk/nextjs';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#1A2332] flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="lg" dark />
      </div>
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
