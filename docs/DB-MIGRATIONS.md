# CargoIQ database migration

The original CargoIQ repository did not contain a tracked migration history; it used `drizzle-kit push` as its database-management path.

The investigative-evidence rebuild therefore adds an idempotent additive SQL migration at:

`src/lib/db/migrations/0001_investigation_evidence/migration.sql`

It creates the investigation/forecasting tables and indexes only. It does not alter or drop the existing CargoIQ tables.

## Apply

With `DATABASE_URL` configured:

```bash
npm run db:migrate:investigation
```

The script executes the statements sequentially. Because the migration uses `IF NOT EXISTS`, it is safe to retry after a partial deployment.

Do not run database DDL automatically from the normal Vercel build command.

The Drizzle schema files remain the source of truth for the application data model; this SQL migration is the deployment bridge for the new additive domain while the repository establishes a formal migration history.
