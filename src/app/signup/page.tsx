'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '');
    const orgName = String(formData.get('orgName') || '');
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    const confirm = String(formData.get('confirm') || '');

    if (password !== confirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, orgName, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Signup failed.');
        return;
      }

      if (data.token) {
        document.cookie = `better-auth.session_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A2332] flex-col justify-center px-12 xl:px-24">
        <div className="max-w-lg">
          <Logo size="lg" dark />
          <h2 className="mt-8 text-2xl xl:text-3xl font-medium text-white leading-relaxed">
             Start your free shadow audit today.
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            No commitment. No credit card required. See exactly what CargoIQ can recover for your operation.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#B8860B] rounded-full" />
               <span className="text-gray-300">Parallel audit with zero disruption</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#B8860B] rounded-full" />
              <span className="text-gray-300">Verified savings report delivered to your inbox</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#B8860B] rounded-full" />
              <span className="text-gray-300">Cancel anytime. Your data stays yours.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Logo size="lg" />
            <h2 className="mt-4 text-2xl font-bold text-[#1A2332]">Create your account</h2>
          </div>
          <h2 className="hidden lg:block text-3xl font-bold text-[#1A2332] mb-2">Create your account</h2>
           <p className="text-gray-600 mb-8">Start your free shadow audit</p>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organisation Name
              </label>
              <input
                name="orgName"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all"
                placeholder="Acme Freight (Pty) Ltd"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will appear on your invoices and reports
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all"
                placeholder="you@company.co.za"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A2332] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2332]/90 transition-colors disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create Account & Start Free Trial'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#B8860B] font-semibold hover:text-[#D4922B]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
