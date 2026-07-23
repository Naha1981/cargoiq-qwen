'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function OnboardingForm() {
  const { user } = useUser();
  const [name, setName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || ''
  );
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, orgName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1A2332] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Set up your workspace</h2>
        <p className="text-gray-400 mb-6">Tell us a little about you and your organisation.</p>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#243044] text-white border border-white/10 focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Organisation name</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#243044] text-white border border-white/10 focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none"
              placeholder="Acme Freight (Pty) Ltd"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B8860B] text-white py-3 rounded-lg font-semibold hover:bg-[#9a7209] transition-colors disabled:opacity-70"
          >
            {loading ? 'Creating workspace...' : 'Create workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
