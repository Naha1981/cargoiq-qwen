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
    description: 'Automated customs compliance checks against SARS regulations and ICC Incoterms.',
  },
  {
    icon: FileText,
    name: 'CarrierInvoice Auditor',
    description: 'AI detects freight invoice anomalies, duplicates, and pricing discrepancies.',
  },
  {
    icon: Users,
    name: 'Driver Check-In',
    description: 'WhatsApp driver arrival and departure timestamps with automatic billable-detention invoices. No app, no GPS hardware.',
  },
  {
    icon: Eye,
    name: 'RLA Sentinel',
    description: 'Daily monitoring of every importer\'s SARS Registered Local Agent (RLA) status — alerts you to a suspension before you submit a single SAD500.',
  },
  {
    icon: Search,
    name: 'HS Code Classifier',
    description: 'AI HS code classification validated against the SARS 8-digit tariff book, with tariff-amendment alerts.',
  },
  {
    icon: CheckCircle,
    name: 'Shadow Audit',
    description: 'Re-runs all 7 compliance checks over your historical shipments and shows your exact Rand exposure — proof before you pay.',
  },
  {
    icon: Package,
    name: 'Container Tracking',
    description: 'End-to-end container visibility with ETA prediction and exception handling.',
  },
  {
    icon: AlertTriangle,
    name: 'Section 99(2) Tracker',
    description: 'Personal liability risk monitoring for customs clearing agents under the Customs Act.',
  },
  {
    icon: Award,
    name: 'Savings Certificate',
    description: 'Verified monthly savings certificate — boardroom-ready proof of value for management and auditors.',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-cargoiq-navy py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-cargoiq-gold uppercase tracking-[0.2em] mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cargoiq-fg">
            Built for Freight Operations
          </h2>
          <p className="text-lg text-cargoiq-muted max-w-2xl mx-auto mt-4">
            Nine modules. One platform. Complete control over compliance and costs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-cargoiq-subtle">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-cargoiq-deep p-6 md:p-8 group hover:bg-cargoiq-panel transition-colors"
            >
              <span className="font-mono text-xs text-cargoiq-gold/40 mb-4 block">
                {String(index + 1).padStart(2, '0')}
              </span>
              <feature.icon className="w-5 h-5 text-cargoiq-gold mb-4" />
              <h3 className="text-sm font-semibold text-cargoiq-fg mb-2 uppercase tracking-wider">
                {feature.name}
              </h3>
              <p className="text-xs text-cargoiq-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
