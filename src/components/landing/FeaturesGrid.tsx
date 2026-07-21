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
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2332] mb-4">
            Built for Freight Operations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nine modules. One platform. Complete control over compliance and costs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-[#B8860B]/30 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 mb-4 bg-[#B8860B]/10 rounded-xl flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-[#B8860B]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A2332] mb-2">
                {feature.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
