'use client';

import React from 'react';
import {
  Shield,
  FileText,
  Users,
  Eye,
  Search,
  CheckCircle,
  Package,
  AlertTriangle,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    name: 'Compliance Shield',
    description: 'Active monitoring of RLA status and SARS entry deadlines to prevent suspensions.',
    span: 'md:col-span-4 md:row-span-2',
    badge: null,
  },
  {
    icon: FileText,
    name: 'CarrierInvoice Auditor',
    description: 'Cross-reference carrier rates vs quotes instantly.',
    span: 'md:col-span-5 md:row-span-1',
    badge: null,
  },
  {
    icon: Users,
    name: 'Driver Check-In',
    description: 'WhatsApp driver arrival and departure timestamps with automatic billable-detention invoices. No app, no GPS hardware.',
    span: 'md:col-span-3 md:row-span-1',
    badge: 'WhatsApp',
  },
  {
    icon: Eye,
    name: 'RLA Sentinel',
    description: 'Automated license renewal tracking and compliance scoring.',
    span: 'md:col-span-3 md:row-span-2',
    badge: '1 EXPIRING IN 14 DAYS',
  },
  {
    icon: Search,
    name: 'HS Code Classifier',
    description: 'ML-driven tariff classification engine.',
    span: 'md:col-span-5 md:row-span-1',
    badge: null,
  },
  {
    icon: CheckCircle,
    name: 'Shadow Audit',
    description: 'Runs parallel to your legacy ERP to find the gaps it misses.',
    span: 'md:col-span-4 md:row-span-2',
    badge: 'MOST CRITICAL',
  },
  {
    icon: Package,
    name: 'Container Tracking',
    description: 'End-to-end container visibility with ETA prediction and exception handling.',
    span: 'md:col-span-3 md:row-span-1',
    badge: null,
  },
  {
    icon: AlertTriangle,
    name: 'Section 99(2) Tracker',
    description: 'Personal liability risk monitoring for customs clearing agents under the Customs Act.',
    span: 'md:col-span-5 md:row-span-1',
    badge: 'HIGH RISK',
  },
  {
    icon: Award,
    name: 'Savings Certificate',
    description: 'Verified monthly savings certificate — boardroom-ready proof of value for management and auditors.',
    span: 'md:col-span-12 md:row-span-1',
    badge: null,
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 px-margin-page bg-surface-container-low" id="features">
      <h2 className="font-headline-lg text-headline-lg mb-12 uppercase industrial-tracking">Built for High-Velocity Freight</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[180px]">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`${feature.span} border-technical bg-surface p-6 md:p-8 flex flex-col justify-between hover-gold transition-all ${feature.badge === 'MOST CRITICAL' ? 'border-primary' : ''} ${feature.badge === 'HIGH RISK' ? '' : ''}`}
          >
            {feature.badge === 'MOST CRITICAL' && (
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            )}
            <div>
              {feature.badge && (
                <span className="font-label-caps text-label-caps bg-primary text-on-primary px-2 py-1 mb-4 inline-block">{feature.badge}</span>
              )}
              <span className="material-symbols-outlined text-primary text-4xl mb-4">{feature.icon === Shield ? 'security' : feature.icon === FileText ? 'fact_check' : feature.icon === Users ? 'location_on' : feature.icon === Eye ? 'security' : feature.icon === Search ? 'category' : feature.icon === CheckCircle ? 'analytics' : feature.icon === Package ? 'tracking' : feature.icon === AlertTriangle ? 'gavel' : 'workspace_premium'}</span>
              <h3 className="font-headline-md text-headline-md mb-2">{feature.name}</h3>
              <p className="text-on-surface-variant text-body-md">{feature.description}</p>
            </div>
            {feature.badge === '1 EXPIRING IN 14 DAYS' && (
              <div className="bg-risk-red/10 border border-risk-red p-3 mono text-risk-red text-[10px] text-center">
                1 EXPIRING IN 14 DAYS
              </div>
            )}
            {feature.name === 'Container Tracking' && (
              <span className="mono text-on-surface text-right">R52 000 Tracking Logged</span>
            )}
            {feature.name === 'Section 99(2) Tracker' && (
              <span className="mono text-risk-red font-bold">HIGH RISK</span>
            )}
            {feature.name === 'Savings Certificate' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <span className="material-symbols-outlined text-primary text-4xl">workspace_premium</span>
                    <h3 className="font-headline-md text-headline-md">Monthly Cost Recovery Certificate</h3>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="mono text-primary text-xl font-bold">R128,400.00</div>
                      <div className="font-label-caps text-label-caps text-outline">illustrative/typical</div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">download</span>
                  </div>
                </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
