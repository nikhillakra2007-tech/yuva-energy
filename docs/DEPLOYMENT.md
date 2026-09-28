# Deployment

STATUS: NOT READY FOR PRODUCTION. No application deployment has occurred. Do not execute the current schema against a live database until Phase 1 is verified.

The existing SQL requires PostgreSQL with PostGIS, pgcrypto, uuid-ossp, auth.uid() and Supabase-compatible database roles. Apply a tracked migration sequence exactly once, or the generated aggregate to a fresh database; never both to the same database. Production migration tracking and Supabase version compatibility remain to be established.

Before production: resolve the database audit, verify two-user/anonymous authorization, configure Supabase Auth and allowed redirect origins, select backend/frontend hosts, pin dependencies, configure private environment variables through host secret stores, verify provider licenses/access, provision imagery/model object storage and retention, run end-to-end tests, and document restore procedures. ZIPs back up source files only, not live database contents. No Schneider hardware/API integration is claimed.

Local database verification is now reproducible with scripts/verify_database.mjs; see DATABASE_VERIFICATION.md for startup/shutdown commands and limitations. The aggregate is generated and checked by scripts/build_migration_bundle.mjs. A successful local test is not production deployment approval or evidence of working Supabase Auth.
