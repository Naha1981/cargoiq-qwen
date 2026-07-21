'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A2332] flex-col justify-center px-12 xl:px-24">
        <div className="max-w-lg">
          <Logo size="lg" dark />
          <blockquote className="mt-12 text-2xl xl:text-3xl font-medium text-white leading-relaxed">
            &ldquo;Freight compliance isn&apos;t optional. CargoIQ made it effortless.&rdquo;
          </blockquote>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-mono text-3xl font-bold text-[#EF4444]">R14,169</span>
              <span className="text-gray-400">Saved in average SARS penalties</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-3xl font-bold text-[#EF4444]">25%</span>
              <span className="text-gray-400">Carrier overcharges recovered</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-3xl font-bold text-[#EF4444]">R59,400</span>
              <span className="text-gray-400">Unbilled detention recovered monthly</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Logo size="lg" />
          </div>
          <h2 className="text-3xl font-bold text-[#1A2332] mb-2">Welcome back</h2>
          <p className="text-gray-600 mb-8">Sign in to your CargoIQ account</p>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all"
                  placeholder="Enter your password"
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
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-[#B8860B] hover:text-[#D4922B]">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-[#1A2332] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2332]/90 transition-colors"
            >
              Sign In
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#B8860B] font-semibold hover:text-[#D4922B]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
