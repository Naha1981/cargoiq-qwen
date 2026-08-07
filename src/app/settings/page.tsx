'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
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
  Trash2,
  Pencil,
  QrCode,
  Unplug,
  Radio,
  Send,
  Loader2,
  UserPlus,
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

/* ---- WhatsApp tab types ---- */
interface GatewayHealth {
  reachable: boolean;
  configured: boolean;
  connectionState?: string;
  instance?: string;
  error?: string;
}

interface CheckinRow {
  id: string;
  reference: string;
  location: string | null;
  status: string;
  type: 'ARRIVED' | 'DEPARTED';
  arrivedAt: string;
  departedAt: string | null;
  driverName: string | null;
  driverPhone: string | null;
  recognised: boolean;
}

interface DriverRow {
  id: string;
  name: string | null;
  phoneNumber: string;
  defaultLocation: string | null;
  active: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('org');
  const [copied, setCopied] = useState(false);

  /* ---- WhatsApp tab state ---- */
  const [gwHealth, setGwHealth] = useState<GatewayHealth>({ reachable: false, configured: false });
  const [gwLoading, setGwLoading] = useState(false);
  const [qrImg, setQrImg] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [testSendLoading, setTestSendLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [feedHighlight, setFeedHighlight] = useState<string | null>(null);

  /* ---- Driver mapping state ---- */
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [addDriverName, setAddDriverName] = useState('');
  const [addDriverPhone, setAddDriverPhone] = useState('');
  const [addDriverLocation, setAddDriverLocation] = useState('');
  const [addDriverLoading, setAddDriverLoading] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  /* ---- Poll refs ---- */
  const statusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCheckinCountRef = useRef(0);

  const fetchGatewayHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/health');
      if (res.ok) {
        const data = await res.json();
        setGwHealth(data);
        setConnected(data.reachable && data.connectionState === 'open');
        setConnectionState(data.connectionState ?? null);
      }
    } catch {
      // network-level failure → unreachable
    }
  }, []);

  const fetchCheckins = useCallback(async () => {
    try {
      setCheckinsLoading(true);
      const res = await fetch('/api/whatsapp/checkins');
      if (res.ok) {
        const { data } = await res.json();
        const arr: CheckinRow[] = Array.isArray(data) ? data : [];
        const prevCount = prevCheckinCountRef.current;
        if (arr.length > prevCount && prevCount > 0) {
          // New row arrived since last poll — highlight it
          setFeedHighlight(arr[0]?.id ?? null);
          setTimeout(() => setFeedHighlight(null), 6000);
        }
        prevCheckinCountRef.current = arr.length;
        setCheckins(arr);
      }
    } catch {
      // silent — feed loads when available
    } finally {
      setCheckinsLoading(false);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      setDriversLoading(true);
      const res = await fetch('/api/v1/drivers');
      if (res.ok) {
        const { data } = await res.json();
        setDrivers(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setDriversLoading(false);
    }
  }, []);

  /* Load gateway health on mount + tab switch */
  useEffect(() => {
    if (activeTab === 'whatsapp') {
      setGwLoading(true);
      fetchGatewayHealth().finally(() => setGwLoading(false));
      fetchCheckins();
      fetchDrivers();
    }
  }, [activeTab, fetchGatewayHealth, fetchCheckins, fetchDrivers]);

  /* Status poll: every 4s while on whatsapp tab, stops when not connected or off tab */
  useEffect(() => {
    if (activeTab !== 'whatsapp') return;
    statusPollRef.current = setInterval(() => {
      fetchGatewayHealth();
    }, 4000);
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [activeTab, fetchGatewayHealth]);

  /* Feed poll: every 8s when connected, for test-the-loop live indicator */
  useEffect(() => {
    if (activeTab !== 'whatsapp' || !connected) return;
    feedPollRef.current = setInterval(() => {
      fetchCheckins();
    }, 8000);
    return () => {
      if (feedPollRef.current) clearInterval(feedPollRef.current);
    };
  }, [activeTab, connected, fetchCheckins]);

  const handleConnect = async () => {
    setQrLoading(true);
    setQrError(null);
    setQrImg(null);
    try {
      const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      if (data.ok && data.qr) {
        setQrImg(data.qr);
      } else {
        setQrError(data.error || 'Failed to fetch QR');
      }
    } catch {
      setQrError('Network error contacting Evolution gateway');
    } finally {
      setQrLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnectLoading(true);
    try {
      const res = await fetch('/api/whatsapp/disconnect', { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setConnected(false);
        setQrImg(null);
        setConnectionState(null);
        fetchGatewayHealth();
      }
    } catch {
      // silent
    } finally {
      setDisconnectLoading(false);
    }
  };

  const handleTestSend = async () => {
    if (!testPhoneNumber.trim()) return;
    setTestSendLoading(true);
    try {
      const res = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: testPhoneNumber }),
      });
      const data = await res.json();
      if (data.ok) {
        // Trigger an immediate feed poll after a short delay to catch the reply
        setTimeout(() => fetchCheckins(), 3000);
      }
    } catch {
      // silent
    } finally {
      setTestSendLoading(false);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDriverName.trim() || !addDriverPhone.trim()) return;
    setAddDriverLoading(true);
    try {
      const res = await fetch('/api/v1/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addDriverName,
          phoneNumber: addDriverPhone,
          defaultLocation: addDriverLocation || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddDriverName('');
        setAddDriverPhone('');
        setAddDriverLocation('');
        fetchDrivers();
      }
    } catch {
      // silent
    } finally {
      setAddDriverLoading(false);
    }
  };

  const handleEditDriver = (d: DriverRow) => {
    setEditingDriverId(d.id);
    setEditName(d.name ?? '');
    setEditPhone(d.phoneNumber);
    setEditLocation(d.defaultLocation ?? '');
  };

  const handleSaveEdit = async (id: string) => {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/v1/drivers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phoneNumber: editPhone,
          defaultLocation: editLocation || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingDriverId(null);
        fetchDrivers();
      }
    } catch {
      // silent
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/drivers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDrivers();
      }
    } catch {
      // silent
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Manage your organisation, integrations and security.</p>

        <div className="mt-6 flex gap-2 border-b border-outline-variant">
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
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-on-surface-variant hover:text-primary'
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
            <>
            <Card title="Appearance" subtitle="Choose how CargoIQ looks for you. Switch anytime.">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">Theme</h4>
                  <p className="text-sm text-on-surface-variant">Light is the clean white default. Dark is the warm terminal look.</p>
                </div>
                <ThemeToggle />
              </div>
            </Card>
            <Card title="Organisation" subtitle="Update your company details and billing contact.">
              <div className="space-y-4">
                <Input label="Organisation name" defaultValue="CargoIQ Demo Pty Ltd" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-on-surface">Plan status</span>
                  <Badge variant="warning">Growth</Badge>
                </div>
                <Input label="Billing contact email" type="email" defaultValue="billing@cargoiq.io" />
                <Button className="ember-button">Save changes</Button>
              </div>
            </Card>
            </>
          )}

          {activeTab === 'email' && (
            <Card title="Email" subtitle="Configure Gmail OAuth for automated communications.">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Gmail OAuth</h4>
                    <p className="text-sm text-on-surface-variant">Connect a Gmail account for sending and parsing emails.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="neutral">Not connected</Badge>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" disabled>Connect</Button>
                  <Button variant="ghost" className="text-risk-red hover:text-risk-red" disabled>Disconnect</Button>
                </div>
                <p className="text-xs text-on-surface-variant"> Coming soon</p>
              </div>
            </Card>
          )}

          {activeTab === 'portals' && (
            <Card title="Portals" subtitle="Manage customs portal credentials for automated submissions.">
              <div className="space-y-6">
                <div className="rounded-lg border border-outline-variant bg-surface-container-high p-4">
                  <p className="text-sm text-success">
                    <strong>Credential vault</strong> — Stored encrypted with ENCRYPTION_KEY.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-lg border border-outline-variant p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-on-surface">SAPS ECS</h4>
                        <p className="text-xs text-on-surface-variant">Not connected</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2" disabled>
                        <RefreshCw className="h-4 w-4" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-outline-variant p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-on-surface">SARS eFiling</h4>
                        <p className="text-xs text-on-surface-variant">Not connected</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2" disabled>
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
                    <Button className="ember-button gap-2" disabled>
                      <Plus className="h-4 w-4" />
                      Save credentials
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {activeTab === 'whatsapp' && (
            <Card title="WhatsApp" subtitle="Evolution API gateway for driver check-ins and status updates.">
              <div className="space-y-6">

                {/* ─── GATEWAY HEALTH ROW ─── */}
                <div className="flex items-center justify-between rounded-lg border border-outline-variant p-4">
                  <div className="flex items-center gap-3">
                    {gwLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />
                    ) : (
                      <div
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          gwHealth.configured && gwHealth.reachable
                            ? connected
                              ? 'bg-success'
                              : 'bg-warn'
                            : gwHealth.configured
                              ? 'bg-risk-red'
                              : 'bg-warn'
                        )}
                      />
                    )}
                    <div>
                      <span className="text-sm font-medium text-on-surface">
                        {gwLoading
                          ? 'Checking gateway…'
                          : gwHealth.configured && gwHealth.reachable
                            ? connected
                              ? `Gateway connected${gwHealth.instance ? ` · ${gwHealth.instance}` : ''}`
                              : 'Gateway reachable — pending connection'
                            : gwHealth.configured
                              ? 'Gateway unreachable'
                              : 'Evolution not configured'}
                      </span>
                      {gwHealth.error && (
                        <p className="mt-0.5 text-xs text-on-surface-variant">{gwHealth.error}</p>
                      )}
                    </div>
                  </div>
                  {!connected && (
                    <Button
                      size="sm"
                      className="ember-button gap-2"
                      disabled={gwLoading || !gwHealth.reachable || !gwHealth.configured}
                      onClick={handleConnect}
                    >
                      {qrLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                      {qrLoading ? 'Connecting…' : 'Connect WhatsApp'}
                    </Button>
                  )}
                </div>

                {/* ─── QR PANEL (STATE A: not connected, after clicking Connect) ─── */}
                {!connected && qrImg && (
                  <div className="rounded-lg border border-outline-variant p-4">
                    <h4 className="text-sm font-semibold text-on-surface">Scan QR with WhatsApp</h4>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Open WhatsApp → Linked Devices → Link a Device → scan this QR. The gateway status
                      above will update after the device is recognised by Evolution.
                    </p>
                    <div className="mt-4 flex justify-center">
                      <img
                        src={qrImg}
                        alt="WhatsApp QR code"
                        className="h-56 w-56 rounded-lg border border-outline-variant bg-white"
                      />
                    </div>
                    <p className="mt-3 text-center text-xs text-on-surface-variant">
                      {qrError ? `QR error: ${qrError}` : 'Waiting for device scan — status polls every 4 s'}
                    </p>
                  </div>
                )}
                {qrLoading && !qrImg && !connected && (
                  <div className="flex items-center gap-3 rounded-lg border border-outline-variant p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-on-surface-variant">Requesting QR from Evolution…</span>
                  </div>
                )}

                {/* ─── CONNECTED STATE (STATE B) ─── */}
                {connected && (
                  <>
                    <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-success" />
                        <div>
                          <span className="text-sm font-semibold text-success">
                            Gateway connected
                          </span>
                          {gwHealth.instance && (
                            <span className="ml-2 text-xs text-on-surface-variant">
                              Instance: {gwHealth.instance}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-risk-red hover:text-risk-red"
                        disabled={disconnectLoading}
                        onClick={handleDisconnect}
                      >
                        {disconnectLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Unplug className="h-4 w-4" />
                        )}
                        {disconnectLoading ? 'Disconnecting…' : 'Disconnect'}
                      </Button>
                    </div>

                    {/* ─── WEBHOOK URL (read-only, derived from app origin) ─── */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-on-surface">
                        Webhook URL
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
                          {typeof window !== 'undefined'
                            ? `${window.location.origin}/api/webhooks/evolution`
                            : '/api/webhooks/evolution'}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(
                              `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/evolution`
                            )
                          }
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Set this URL in your Evolution instance webhook configuration.
                      </p>
                    </div>

                    {/* ─── TEST THE LOOP ─── */}
                    <div className="rounded-lg border border-outline-variant p-4">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                        <Radio className="h-4 w-4" />
                        Test the loop
                      </h4>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Send <span className="font-mono text-success">ARRIVED</span> via WhatsApp to the
                        connected number. The check-in feed below will highlight the new row as it arrives
                        through the webhook (polls every 8 s).
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Input
                          placeholder="+27821234567"
                          value={testPhoneNumber}
                          onChange={(e) => setTestPhoneNumber(e.target.value)}
                          className="max-w-xs"
                        />
                        <Button
                          size="sm"
                          className="ember-button gap-2"
                          disabled={testSendLoading || !testPhoneNumber.trim()}
                          onClick={handleTestSend}
                        >
                          {testSendLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Send test message
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        Sends a test WhatsApp message to the number above. The recipient should reply with{' '}
                        <span className="font-mono text-success">ARRIVED TEST-001 Bay 7</span> to
                        complete the loop.
                      </p>
                    </div>
                  </>
                )}

                {/* ─── DRIVER CHECK-IN FEED ─── */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-on-surface">Driver check-in feed</h4>
                    {!connected && (
                      <span className="rounded border border-outline-variant bg-surface-container-low px-1.5 py-0.5 text-label-caps text-on-surface-variant uppercase tracking-wider text-xs">
                        Viewing sample data
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {!connected
                      ? 'Connect WhatsApp above to see real-time check-ins here.'
                      : 'Last 25 check-ins received via WhatsApp webhook.'}
                  </p>
                  <div className="mt-3 space-y-2">
                    {!connected && (
                      /* Honest sample rows when not connected — the mockCheckins shape, clearly tagged */
                      <>
                        {[
                          { driver: 'J. van der Merwe', status: 'ARRIVED', location: 'CT Container Terminal', time: '10:42' },
                          { driver: 'S. Ndlovu', status: 'DEPARTED', location: 'Johannesburg Hub', time: '10:15' },
                          { driver: 'A. Patel', status: 'STATUS', location: 'Durban Port', time: '09:58' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="info" className="font-mono text-xs">{item.status}</Badge>
                              <div>
                                <p className="text-sm font-medium text-on-surface">{item.driver}</p>
                                <p className="text-xs text-on-surface-variant">{item.location}</p>
                              </div>
                            </div>
                            <span className="text-xs text-on-surface-variant">{item.time}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {connected && checkins.length === 0 && !checkinsLoading && (
                      <div className="rounded-lg border border-dashed border-outline-variant p-6 text-center">
                        <MessageCircle className="mx-auto h-8 w-8 text-on-surface-variant" />
                        <p className="mt-2 text-sm text-on-surface-variant">No check-ins yet.</p>
                        <p className="text-xs text-on-surface-variant">
                          Send <span className="font-mono text-success">ARRIVED</span> via WhatsApp to see
                          rows appear here.
                        </p>
                      </div>
                    )}
                    {connected && checkinsLoading && checkins.length === 0 && (
                      <div className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant p-6">
                        <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />
                        <span className="text-sm text-on-surface-variant">Loading feed…</span>
                      </div>
                    )}
                    {connected &&
                      checkins.map((row) => (
                        <div
                          key={row.id}
                          className={cn(
                            'flex items-center justify-between rounded-lg border px-4 py-3 transition-all',
                            feedHighlight === row.id
                              ? 'border-success bg-success/10 ring-1 ring-success/30'
                              : 'border-outline-variant bg-surface-container'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="info" className="font-mono text-xs">{row.type}</Badge>
                            <div>
                              <p className="text-sm font-medium text-on-surface">
                                {row.recognised ? row.driverName : row.driverPhone ?? 'Unknown number'}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                {row.reference}
                                {row.location ? ` · ${row.location}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-on-surface-variant">
                            {new Date(row.arrivedAt).toLocaleTimeString('en-ZA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* ─── DRIVER MAPPING TABLE ─── */}
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">Driver phone mapping</h4>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Map WhatsApp numbers to driver names. Phone numbers are normalised to +27 on save.
                    These mappings are used by the webhook to resolve inbound sender numbers.
                  </p>

                  {/* Add driver form */}
                  <form onSubmit={handleAddDriver} className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                    <Input
                      label="Name"
                      placeholder="e.g. J. van der Merwe"
                      value={addDriverName}
                      onChange={(e) => setAddDriverName(e.target.value)}
                      className="w-40"
                    />
                    <Input
                      label="WhatsApp number"
                      placeholder="+27821234567"
                      value={addDriverPhone}
                      onChange={(e) => setAddDriverPhone(e.target.value)}
                      className="w-40"
                    />
                    <Input
                      label="Default location (optional)"
                      placeholder="CT Container Terminal"
                      value={addDriverLocation}
                      onChange={(e) => setAddDriverLocation(e.target.value)}
                      className="w-44"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="ember-button gap-2"
                      disabled={addDriverLoading || !addDriverName.trim() || !addDriverPhone.trim()}
                    >
                      {addDriverLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Add driver
                    </Button>
                  </form>

                  {/* Driver list */}
                  {driversLoading && drivers.length === 0 && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-outline-variant p-6">
                      <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />
                      <span className="text-sm text-on-surface-variant">Loading drivers…</span>
                    </div>
                  )}
                  <div className="mt-3 space-y-2">
                    {drivers.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-lg border border-outline-variant bg-surface-container px-4 py-3"
                      >
                        {editingDriverId === d.id ? (
                          /* Inline edit row */
                          <div className="flex flex-wrap items-end gap-2">
                            <Input
                              label="Name"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-36"
                            />
                            <Input
                              label="Phone"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="w-36"
                            />
                            <Input
                              label="Location"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              className="w-40"
                            />
                            <Button
                              size="sm"
                              className="ember-button"
                              disabled={editLoading}
                              onClick={() => handleSaveEdit(d.id)}
                            >
                              {editLoading ? 'Saving…' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingDriverId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          /* Display row */
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-sm font-medium text-on-surface">{d.name ?? '—'}</p>
                                <p className="text-xs font-mono text-on-surface-variant">{d.phoneNumber}</p>
                              </div>
                              {d.defaultLocation && (
                                <span className="text-xs text-on-surface-variant">{d.defaultLocation}</span>
                              )}
                              <Badge
                                variant={d.active ? 'success' : 'neutral'}
                                className="text-xs"
                              >
                                {d.active ? 'Recognised' : 'No messages yet'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditDriver(d)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-risk-red hover:text-risk-red"
                                onClick={() => handleDeleteDriver(d.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ─── COMMAND REFERENCE ─── */}
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">Command reference</h4>
                  <p className="text-xs text-on-surface-variant">Available WhatsApp commands for drivers.</p>
                  <div className="mt-3 rounded-lg border border-outline-variant bg-surface-container p-4 font-mono text-xs text-success">
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
                <Truck className="h-12 w-12 text-on-surface-variant" />
                <h3 className="mt-4 text-lg font-semibold text-on-surface">WiseLayer integration</h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  CargoWise connectivity is planned for Phase 2.
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
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
                  <Button className="ember-button">Update password</Button>
                </div>
              </Card>

              <Card title="Active sessions" subtitle="Devices currently signed in to your account.">
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'Johannesburg, ZA', current: true },
                    { device: 'Safari on iPhone', location: 'Cape Town, ZA', current: false },
                    { device: 'Firefox on macOS', location: 'Durban, ZA', current: false },
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-on-surface">{session.device}</p>
                        <p className="text-xs text-on-surface-variant">{session.location}</p>
                      </div>
                      {session.current ? (
                        <Badge variant="success">Current</Badge>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-risk-red hover:text-risk-red">Sign out</Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button variant="outline" className="border-risk-red text-risk-red hover:bg-risk-red/10">
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
