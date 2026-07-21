'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Building2,
  Mail,
  Network,
  MessageCircle,
  Truck,
  Shield,
  Copy,
  Check,
  RefreshCw,
  Plus,
} from 'lucide-react';

const tabs = [
  { id: 'org', label: 'Org', icon: Building2 },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'portals', label: 'Portals', icon: Network },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'cargowise', label: 'CargoWise', icon: Truck },
  { id: 'security', label: 'Security', icon: Shield },
] as const;

type TabId = (typeof tabs)[number]['id'];

const mockCheckins = [
  { id: 1, driver: 'J. van der Merwe', status: 'ARRIVED', location: 'CT Container Terminal', time: '10:42' },
  { id: 2, driver: 'S. Ndlovu', status: 'DEPARTED', location: 'Johannesburg Hub', time: '10:15' },
  { id: 3, driver: 'A. Patel', status: 'STATUS', location: 'Durban Port', time: '09:58' },
  { id: 4, driver: 'M. Botha', status: 'RLA', location: 'Cape Town CBD', time: '09:30' },
  { id: 5, driver: 'P. Mthembu', status: 'ARRIVED', location: 'OR Tambo', time: '09:12' },
  { id: 6, driver: 'R. Khan', status: 'HELP', location: 'Midrand', time: '08:55' },
  { id: 7, driver: 'T. Esterhuizen', status: 'ARRIVED', location: 'Port Elizabeth', time: '08:40' },
  { id: 8, driver: 'N. Mokoena', status: 'DEPARTED', location: 'Bloemfontein', time: '08:22' },
  { id: 9, driver: 'D. Naidoo', status: 'STATUS', location: 'Pretoria', time: '08:05' },
  { id: 10, driver: 'G. Coetzee', status: 'ARRIVED', location: 'East London', time: '07:48' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('org');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your organisation, integrations and security.</p>

        <div className="mt-6 flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {activeTab === 'org' && (
            <Card title="Organisation" subtitle="Update your company details and billing contact.">
              <div className="space-y-4">
                <Input label="Organisation name" defaultValue="CargoIQ Demo Pty Ltd" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Plan status</span>
                  <Badge variant="warning">Growth</Badge>
                </div>
                <Input label="Billing contact email" type="email" defaultValue="billing@cargoiq.io" />
                <Button>Save changes</Button>
              </div>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card title="Email" subtitle="Configure Gmail OAuth for automated communications.">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Gmail OAuth</h4>
                    <p className="text-sm text-gray-500">Connect a Gmail account for sending and parsing emails.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">AUTO</span>
                      <button
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          true ? 'bg-amber-500' : 'bg-gray-200'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                            true ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                      <span className="text-xs font-medium text-gray-500">MANUAL</span>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Connect</Button>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700">Disconnect</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'portals' && (
            <Card title="Portals" subtitle="Manage customs portal credentials for automated submissions.">
              <div className="space-y-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Credential vault</strong> — Stored encrypted with ENCRYPTION_KEY.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">SAPS ECS</h4>
                        <p className="text-xs text-gray-500">Last synced 2 minutes ago</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">SARS eFiling</h4>
                        <p className="text-xs text-gray-500">Last synced 15 minutes ago</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </div>
                <Card title="Add portal credentials" className="border-dashed">
                  <div className="space-y-4">
                    <Input label="Portal" placeholder="e.g. SARS eFiling" />
                    <Input label="Username" placeholder="Enter username" />
                    <Input label="Password" type="password" placeholder="Enter password" />
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Save credentials
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {activeTab === 'whatsapp' && (
            <Card title="WhatsApp" subtitle="Evolution API setup for driver check-ins and status updates.">
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-gray-900">Connected</span>
                  </div>
                  <Button size="sm" variant="outline">Disconnect</Button>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Webhook URL</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      https://api.cargoiq.io/webhooks/evolution
                    </code>
                    <Button size="sm" variant="ghost" className="gap-2" onClick={() => copyToClipboard('https://api.cargoiq.io/webhooks/evolution')}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Driver check-in feed</h4>
                  <p className="text-xs text-gray-500">Last 10 check-ins received via WhatsApp.</p>
                  <div className="mt-3 space-y-2">
                    {mockCheckins.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="info" className="font-mono text-xs">{item.status}</Badge>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.driver}</p>
                            <p className="text-xs text-gray-500">{item.location}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Command reference</h4>
                  <p className="text-xs text-gray-500">Available WhatsApp commands for drivers.</p>
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-900 p-4 font-mono text-xs text-green-400">
                    <p>ARRIVED — Check in at destination</p>
                    <p>DEPARTED — Confirm departure</p>
                    <p>STATUS — Request current status</p>
                    <p>RLA — Ready to load announcement</p>
                    <p>HELP — Show command list</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'cargowise' && (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Truck className="h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">WiseLayer integration</h3>
                <p className="mt-2 text-sm text-gray-500">
                  CargoWise connectivity is planned for Phase 2.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  We are evaluating API availability and data-mapping requirements.
                </p>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card title="Change password" subtitle="Update your account password.">
                <div className="space-y-4 max-w-md">
                  <Input label="Current password" type="password" />
                  <Input label="New password" type="password" />
                  <Input label="Confirm new password" type="password" />
                  <Button>Update password</Button>
                </div>
              </Card>

              <Card title="Active sessions" subtitle="Devices currently signed in to your account.">
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'Johannesburg, ZA', current: true },
                    { device: 'Safari on iPhone', location: 'Cape Town, ZA', current: false },
                    { device: 'Firefox on macOS', location: 'Durban, ZA', current: false },
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{session.device}</p>
                        <p className="text-xs text-gray-500">{session.location}</p>
                      </div>
                      {session.current ? (
                        <Badge variant="success">Current</Badge>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">Sign out</Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  Sign out all devices
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
