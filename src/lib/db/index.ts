import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as investigationSchema from './investigation-schema';

export const db = process.env.DATABASE_URL
  ? drizzle(neon(process.env.DATABASE_URL), {
      schema: { ...schema, ...investigationSchema },
    })
  : null;
