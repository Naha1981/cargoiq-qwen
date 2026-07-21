'use client';

import { useState } from 'react';
import { ArrowRight, Ship, Truck, Globe, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

const operationTypes = [
  { id: 'customs', label: 'Clear Customs', icon: Ship, desc: 'Focus on customs clearing and compliance' },
  { id: 'truck', label: 'Truck Fleet', icon: Truck, desc: 'Manage road transport and logistics' },
  { id: 'cross-border', label: 'Cross-Border SADC', icon: Globe, desc: 'Handle regional SADC freight flows' },
  { id: 'importer', label: 'Manage Importer Clients', icon: Users, desc: 'Support multiple importers' },
];

const painOptions = [
  { id: 'overcharge', label: 'Hidden overcharges on invoices' },
  { id: 'demurrage', label: 'Demurrage and detention fees' },
  { id: 'disputes', label: 'Manual dispute drafting' },
  { id: 'compliance', label: 'Regulatory compliance tracking' },
  { id: 'visibility', label: 'Lack of shipment visibility' },
];

const recommendations: Record<string, string> = {
  overcharge: 'Run a Carrier Audit on your latest invoices to catch hidden overcharges.',
  demurrage: 'Enable Sentinel monitoring to track demurrage windows in real time.',
  disputes: 'Upload your last 5 invoices to auto-generate dispute notices.',
  compliance: 'Set up compliance checks for your top trade lanes.',
  visibility: 'Connect your first carrier portal to start live tracking.',
};

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [operation, setOperation] = useState<string>('');
  const [pain, setPain] = useState<string>('');

  const recommendation = recommendations[pain] || 'Start by uploading a document to see CargoIQ in action.';

  const canNext = step === 1 ? operation !== '' : step === 2 ? pain !== '' : true;

  return (
    <div className="min-h-screen bg-[#F1F4F8] text-[#0D1B2A] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#1A2332]">Welcome to CargoIQ</h1>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-[#1A2332]">Set up later</a>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="font-medium text-[#1A2332]">Step {step} of 3</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#B8860B] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1A2332]">What kind of operation?</h2>
              <p className="text-sm text-gray-500 mt-1">Select all that apply</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {operationTypes.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setOperation(op.id === operation ? '' : op.id)}
                  className={cn(
                    'flex items-start gap-4 rounded-xl border p-4 text-left transition-all',
                    operation === op.id
                      ? 'border-[#B8860B] bg-[#B8860B]/5 shadow-sm'
                      : 'border-[#E2E8F0] bg-white hover:border-[#B8860B]'
                  )}
                >
                  <div className={cn(
                    'rounded-lg p-2',
                    operation === op.id ? 'bg-[#B8860B]/10 text-[#B8860B]' : 'bg-gray-100 text-gray-500'
                  )}>
                    <op.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1A2332]">{op.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{op.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1A2332]">What&apos;s your biggest pain right now?</h2>
              <p className="text-sm text-gray-500 mt-1">Pick the one that hurts most</p>
            </div>
            <div className="space-y-3">
              {painOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all',
                    pain === opt.id
                      ? 'border-[#B8860B] bg-[#B8860B]/5'
                      : 'border-[#E2E8F0] bg-white hover:border-[#B8860B]'
                  )}
                >
                  <input
                    type="radio"
                    name="pain"
                    value={opt.id}
                    checked={pain === opt.id}
                    onChange={() => setPain(opt.id)}
                    className="accent-[#B8860B]"
                  />
                  <span className="text-sm font-medium text-[#1A2332]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1A2332]">You&apos;re ready. Here&apos;s where to start.</h2>
              <p className="text-sm text-gray-500 mt-1">Based on your answers, we recommend:</p>
            </div>
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
              <p className="text-sm text-gray-700 mb-4">{recommendation}</p>
              <button className="inline-flex items-center gap-2 bg-[#B8860B] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#9a7209] transition-colors">
                Take Recommended Action
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep((s) => (s > 1 ? (s - 1) as Step : s))}
            disabled={step === 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#1A2332] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={() => setStep((s) => (s < 3 ? (s + 1) as Step : s))}
            disabled={!canNext}
            className="inline-flex items-center gap-2 bg-[#B8860B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9a7209] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? 'Finish' : 'Next'}
            {step < 3 && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
