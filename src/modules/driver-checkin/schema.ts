import { z } from 'zod';

export const whatsappCheckInSchema = z.object({
  instanceName: z.string().optional(),
  source: z.string(),
  message: z.string(),
  timestamp: z.number().optional(),
  messageId: z.string().optional(),
});

export type WhatsappCheckInInput = z.infer<typeof whatsappCheckInSchema>;

export const driverCheckInCommandSchema = z.object({
  type: z.enum(['ARRIVED', 'DEPARTED', 'STATUS', 'RLA', 'HELP']),
  reference: z.string().optional(),
  location: z.string().optional(),
});
