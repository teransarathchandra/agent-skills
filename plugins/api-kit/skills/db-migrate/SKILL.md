---
name: db-migrate
description: Make a database schema change safely with Drizzle migration files and a Neon branch, never direct DDL.
disable-model-invocation: true
argument-hint: <change description>
---
Change: $ARGUMENTS
1. Edit the Drizzle schema, then `npx drizzle-kit generate` and show me the SQL migration file.
2. Apply it to a disposable Neon branch (not production), run the test suite against that branch.
3. Note data backfills or destructive steps (drops, type changes) explicitly and ask before including them.
4. Never run DDL through an MCP tool or against the main/production database.
