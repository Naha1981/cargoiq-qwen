'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

export default function CalculatorPage() {
  const [containers, setContainers] = useState(20);
  const [hasFleet, setHasFleet] = useState(false);
  const [hasSADC, setHasSADC] = useState(false);
  const [isHighValue, setIsHighValue] = useState(false);

  const results = useMemo(() => {
    const basePerContainer = 1086.7;
    let monthlyLeakage = containers * basePerContainer;

    if (hasFleet) monthlyLeakage *= 1.25;
    if (hasSADC) monthlyLeakage *= 1.15;
    if (isHighValue) monthlyLeakage *= 1.3;

    const categories = [
      { name: 'Carrier Overcharges', pct: 0.35, amount: monthlyLeakage * 0.35 },
      { name: 'Unbilled Detention', pct: 0.25, amount: monthlyLeakage * 0.25 },
      { name: 'SARS Penalties', pct: 0.20, amount: monthlyLeakage * 0.20 },
      { name: 'HS Code Mismatches', pct: 0.12, amount: monthlyLeakage * 0.12 },
      { name: 'Other Leakage', pct: 0.08, amount: monthlyLeakage * 0.08 },
    ];

    const annualLoss = monthlyLeakage * 12;
    const recoveryRate = 0.35;
    const annualRecovery = annualLoss * recoveryRate;
    const roi = annualRecovery > 0 ? (annualRecovery / 18000) : 0;

    return { monthlyLeakage, annualLoss, recoveryRate, annualRecovery, roi, categories };
  }, [containers, hasFleet, hasSADC, isHighValue]);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-primary-container px-4 py-2 rounded-full font-label-caps text-label-caps mb-6">
            <Calculator className="w-4 h-4" />
            Freight Leakage Calculator
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How much is your freight operation leaking?
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
            Adjust the inputs below to estimate your monthly revenue leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-elevated rounded border border-outline-variant p-6">
            <h2 className="text-2xl font-semibold mb-8">Your Operation</h2>

            <div className="mb-8">
              <label className="block text-sm font-medium text-on-surface-variant mb-4">
                Monthly Container Throughput
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={containers}
                onChange={(e) => setContainers(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-high rounded appearance-none cursor-pointer accent-primary-container"
              />
              <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
                <span>5</span>
                <span className="font-mono text-primary-container text-lg">{containers} containers</span>
                <span>100</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hasFleet}
                  onChange={(e) => setHasFleet(e.target.checked)}
                  className="w-5 h-5 rounded bg-surface-container-high border-outline-variant text-primary-container focus:ring-primary-container focus:ring-offset-0"
                />
                <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">
                  I operate a dedicated fleet
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hasSADC}
                  onChange={(e) => setHasSADC(e.target.checked)}
                  className="w-5 h-5 rounded bg-surface-container-high border-outline-variant text-primary-container focus:ring-primary-container focus:ring-offset-0"
                />
                <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">
                  I handle SADC cross-border freight
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isHighValue}
                  onChange={(e) => setIsHighValue(e.target.checked)}
                  className="w-5 h-5 rounded bg-surface-container-high border-outline-variant text-primary-container focus:ring-primary-container focus:ring-offset-0"
                />
                <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Monthly cargo value exceeds R500k
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-elevated rounded border border-outline-variant p-6">
              <h2 className="text-headline-md font-semibold mb-4 text-on-surface">Estimated Monthly Leakage</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs text-on-surface-variant">R</span>
                <span className="font-mono text-5xl md:text-6xl font-bold text-risk-red">
                  {Math.round(results.monthlyLeakage).toLocaleString('en-ZA')}
                </span>
              </div>
              <p className="text-on-surface-variant text-sm">per month in unmonitored losses</p>
            </div>

            <div className="bg-elevated rounded border border-outline-variant p-6">
              <h3 className="text-lg font-semibold mb-4">Breakdown</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-on-surface-variant border-b border-outline-variant">
                    <th className="text-left pb-3 font-medium">Category</th>
                    <th className="text-right pb-3 font-medium">Est. Amount</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface-variant">
                  {results.categories.map((cat, i) => (
                    <tr key={i} className="border-b border-outline-variant/50">
                      <td className="py-3">{cat.name}</td>
                      <td className="text-right font-mono text-risk-red">
                        R{Math.round(cat.amount).toLocaleString('en-ZA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-primary-container/10 border border-primary-container/30 rounded p-6">
              <h3 className="text-xl font-semibold mb-2 text-on-surface">
                With CargoIQ Growth Plan
              </h3>
              <p className="text-on-surface-variant mb-4">
                Based on 35% average recovery rate:
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl font-bold text-primary-container">
                  {results.roi.toFixed(1)}x
                </span>
                <span className="text-on-surface-variant">ROI</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">
                R{Math.round(results.annualRecovery).toLocaleString('en-ZA')} recovered annually against R180,000 annual cost.
              </p>
              <a
                href="/signup"
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded font-label-caps font-medium hover:bg-primary transition-colors transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
