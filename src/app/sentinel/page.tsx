'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, TrendingDown, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockEvents = [
  { id: 1, text: 'Demurrage waived on MSC ANITA', type: 'green' },
  { id: 2, text: 'FSC dispute raised for Maersk', type: 'amber' },
  { id: 3, text: 'New rate card uploaded: CMA CGM', type: 'blue' },
  { id: 4, text: 'Overcharge detected: R12,400', type: 'red' },
  { id: 5, text: 'Shadow audit completed', type: 'green' },
  { id: 6, text: 'Compliance pass: 97%', type: 'blue' },
];

const containersAtRisk = [
  { id: 'MSDU762391', line: 'MSC', days: 12, exposure: 42500 },
  { id: 'MSCU998234', line: 'Maersk', days: 8, exposure: 28400 },
  { id: 'HLCU112344', line: 'Hapag-Lloyd', days: 15, exposure: 52100 },
  { id: 'OOLU887612', line: 'OOCL', days: 6, exposure: 18900 },
];

const unbilledDrivers = [
  { driver: 'J. van der Merwe', location: 'Cape Town', hours: 4.5, value: 8500 },
  { driver: 'S. Nkosi', location: 'Durban', hours: 6.2, value: 12300 },
  { driver: 'P. Botha', location: 'Johannesburg', hours: 3.0, value: 5400 },
  { driver: 'R. Dlamini', location: 'Gqeberha', hours: 5.5, value: 9800 },
];

export default function SentinelPage() {
  const [events, setEvents] = useState(mockEvents);
  const [activeRisk] = useState(231500);
  const [valueDelivered] = useState(1842500);

  const handleExit = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => {
        const next = [...prev];
        const types = ['green', 'amber', 'blue', 'red'] as const;
        const texts = [
          'Demurrage waived on MSC ANITA',
          'FSC dispute raised for Maersk',
          'New rate card uploaded: CMA CGM',
          'Overcharge detected: R12,400',
          'Shadow audit completed',
          'Compliance pass: 97%',
          'Invoice generated: R4,200',
          'Container released: DUR0221',
        ];
        next.push({
          id: Date.now(),
          text: texts[Math.floor(Math.random() * texts.length)],
          type: types[Math.floor(Math.random() * types.length)],
        });
        if (next.length > 8) next.shift();
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const colors: Record<string, string> = {
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white font-sans">
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#020817]/90 backdrop-blur">
        <h1 className="text-lg font-semibold tracking-wide">SENTINEL LIVE</h1>
        <button
          onClick={handleExit}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <span className="text-xs font-semibold tracking-widest text-red-400 mb-2">
              ACTIVE REVENUE AT RISK
            </span>
            <span className="font-mono text-5xl md:text-[80px] font-bold text-[#EF4444] leading-none">
              {activeRisk.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
            </span>
            <TrendingDown className="h-6 w-6 text-red-400 mt-4" />
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <span className="text-xs font-semibold tracking-widest text-green-400 mb-2">
              VALUE DELIVERED
            </span>
            <span className="font-mono text-5xl md:text-[80px] font-bold text-[#22C55E] leading-none">
              {valueDelivered.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
            </span>
            <TrendingUp className="h-6 w-6 text-green-400 mt-4" />
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <span className="text-xs font-semibold tracking-widest text-blue-400 mb-4">
              COMPLIANCE PASS RATE
            </span>
            <div className="relative w-40 h-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray="97, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-3xl font-bold text-[#3B82F6]">97%</span>
              </div>
            </div>
            <Shield className="h-6 w-6 text-blue-400 mt-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Containers at Risk</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="pb-2 font-medium">Container</th>
                    <th className="pb-2 font-medium">Line</th>
                    <th className="pb-2 font-medium">Days Past Free</th>
                    <th className="pb-2 font-medium text-right">Exposure R</th>
                  </tr>
                </thead>
                <tbody>
                  {containersAtRisk.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-white/5',
                        row.exposure > 40000 ? 'bg-red-500/10' : ''
                      )}
                    >
                      <td className="py-3 font-mono text-xs">{row.id}</td>
                      <td className="py-3">{row.line}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
                          {row.days}d
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-xs">
                        {row.exposure.toLocaleString('en-ZA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Unbilled Waiting Time</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="pb-2 font-medium">Driver</th>
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium">Hours</th>
                    <th className="pb-2 font-medium text-right">Value R</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unbilledDrivers.map((row) => (
                    <tr key={row.driver} className="border-b border-white/5">
                      <td className="py-3">{row.driver}</td>
                      <td className="py-3 text-gray-400">{row.location}</td>
                      <td className="py-3">{row.hours.toFixed(1)}</td>
                      <td className="py-3 text-right font-mono text-xs">
                        {row.value.toLocaleString('en-ZA')}
                      </td>
                      <td className="py-3 text-right">
                        <button className="rounded-md bg-[#B8860B] px-3 py-1 text-xs font-medium text-white hover:bg-[#9a7209] transition-colors">
                          Generate Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Live Event Feed</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {events.map((event) => (
              <span
                key={event.id}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  colors[event.type]
                )}
              >
                {event.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
