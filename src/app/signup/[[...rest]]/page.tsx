'use client';

import { SignUp } from '@clerk/nextjs';
import { Logo } from '@/components/ui/logo';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#1A2332] flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="lg" dark />
      </div>
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
