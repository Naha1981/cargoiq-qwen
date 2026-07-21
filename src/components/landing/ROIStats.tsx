'use client';

import React from 'react';
import { TrendingUp, PiggyBank, BarChart3 } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: '21.6x',
    label: 'Return on Investment',
    description: 'Average ROI within first 90 days',
  },
  {
    icon: PiggyBank,
    value: 'R14,169',
    label: 'Saved Per Month',
    description: 'Verified recovery per average client',
  },
  {
    icon: BarChart3,
    value: '7/8',
    label: 'Compliance Pass Rate',
    description: 'Documents passing all 7 automated checks',
  },
];

export function ROIStats() {
  return (
    <section className="bg-[#F1F4F8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2332] mb-4">
            The numbers speak for themselves
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real results from real freight operations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 mx-auto mb-6 bg-[#B8860B]/10 rounded-2xl flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-[#B8860B]" />
              </div>
              <p className="font-mono text-5xl md:text-6xl font-bold text-[#1A2332] mb-4">
                {stat.value}
              </p>
              <h3 className="text-xl font-semibold text-[#1A2332] mb-2">
                {stat.label}
              </h3>
              <p className="text-gray-600 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
