import { pgTable, varchar, timestamp, integer, decimal, boolean, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── TENANTS (Organizations) ───────────────────────────────
export const tenants = pgTable('tenants', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  plan: varchar('plan', { length: 50 }).default('trial').notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── USERS ─────────────────────────────────────────────────
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── DRIVERS (maps WhatsApp numbers to tenants) ────────────
export const drivers = pgTable('drivers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── WAITING TIME FINDINGS ─────────────────────────────────
export const waitingTimeFindings = pgTable('waiting_time_findings', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  driverId: varchar('driver_id', { length: 36 }).references(() => drivers.id),
  reference: varchar('reference', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  arrivedAt: timestamp('arrived_at').notNull(),
  departedAt: timestamp('departed_at'),
  totalMinutes: integer('total_minutes').default(0),
  freeTimeMinutes: integer('free_time_minutes').default(120),
  billableMinutes: integer('billable_minutes').default(0),
  ratePerHourZar: decimal('rate_per_hour_zar', { precision: 10, scale: 2 }).default('1100.00'),
  billableAmountZar: decimal('billable_amount_zar', { precision: 10, scale: 2 }).default('0.00'),
  invoiced: boolean('invoiced').default(false),
  invoiceNumber: varchar('invoice_number', { length: 50 }),
  status: varchar('status', { length: 50 }).default('open').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── SHIPMENTS ─────────────────────────────────────────────
export const shipments = pgTable('shipments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  reference: varchar('reference', { length: 255 }),
  importerCode: varchar('importer_code', { length: 50 }),
  hsCode: varchar('hs_code', { length: 10 }),
  cargoDescription: text('cargo_description'),
  customsValueZar: decimal('customs_value_zar', { precision: 12, scale: 2 }),
  riskScore: integer('risk_score').default(0),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── COMPLIANCE SHIELD RESULTS ─────────────────────────────
export const complianceResults = pgTable('compliance_results', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  shipmentId: varchar('shipment_id', { length: 36 }).notNull().references(() => shipments.id),
  module: varchar('module', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  message: text('message'),
  exposureZar: decimal('exposure_zar', { precision: 12, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── EVENTS (Domain Event Log) ─────────────────────────────
export const events = pgTable('events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id),
  type: varchar('type', { length: 100 }).notNull(),
  payload: text('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── RELATIONS ─────────────────────────────────────────────
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  drivers: many(drivers),
  findings: many(waitingTimeFindings),
  shipments: many(shipments),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  tenant: one(tenants, { fields: [drivers.tenantId], references: [tenants.id] }),
  findings: many(waitingTimeFindings),
}));

export const waitingTimeFindingsRelations = relations(waitingTimeFindings, ({ one }) => ({
  tenant: one(tenants, { fields: [waitingTimeFindings.tenantId], references: [tenants.id] }),
  driver: one(drivers, { fields: [waitingTimeFindings.driverId], references: [drivers.id] }),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  tenant: one(tenants, { fields: [shipments.tenantId], references: [tenants.id] }),
  complianceResults: many(complianceResults),
}));
