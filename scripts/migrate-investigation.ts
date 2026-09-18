import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL_NOT_CONFIGURED");

const migrationPath = resolve(process.cwd(), "src/lib/db/migrations/0001_investigation_evidence/migration.sql");
const migration = await readFile(migrationPath, "utf8");
const statements = migration.split(/;\\s*\\n/).map((statement) => statement.trim()).filter(Boolean);
const sql = neon(databaseUrl);

for (const statement of statements) await sql(statement);

console.log(\`CargoIQ investigation migration applied: \${statements.length} statements\`);
