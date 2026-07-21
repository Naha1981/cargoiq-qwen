import { z } from 'zod';

export const shipmentDocumentSchema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalValue: z.number(),
    hsCode: z.string().optional(),
  })).optional(),
  invoiceTotal: z.number().optional(),
  currency: z.string().default('ZAR'),

  packingListItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    weight: z.number().optional(),
  })).optional(),

  originCountry: z.string().optional(),
  destinationCountry: z.string().default('ZA'),
  isSacuOrigin: z.boolean().optional(),
  customsValueZar: z.number().optional(),
  cargoDescription: z.string().optional(),
  hsCode: z.string().optional(),
  isTemporaryExport: z.boolean().optional(),
  hasDa65Stamp: z.boolean().optional(),
  containsSugar: z.boolean().optional(),
  isCrossBorderRoad: z.boolean().optional(),
  vehicleRegistration: z.string().optional(),
  isForeignRegistered: z.boolean().optional(),
  tmsDeclarationNumber: z.string().optional(),
  importerCode: z.string().optional(),
});

export type ShipmentDocumentInput = z.infer<typeof shipmentDocumentSchema>;

export const complianceCheckResultSchema = z.object({
  module: z.string(),
  moduleName: z.string(),
  status: z.enum(['pass', 'warn', 'hold']),
  message: z.string(),
  exposureZar: z.number().default(0),
  details: z.record(z.any()).optional(),
});

export type ComplianceCheckResult = z.infer<typeof complianceCheckResultSchema>;

export const complianceReportSchema = z.object({
  shipmentId: z.string().optional(),
  tenantId: z.string(),
  results: z.array(complianceCheckResultSchema),
  overallStatus: z.enum(['pass', 'warn', 'hold']),
  totalExposureZar: z.number(),
  checkedAt: z.string(),
});

export type ComplianceReport = z.infer<typeof complianceReportSchema>;
