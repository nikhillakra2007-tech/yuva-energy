# Database verification

STATUS: PARTIALLY COMPLETE. The reconciled database core is tested locally; the full application and deployed Supabase stack are not verified.

## Results

See DATABASE_TEST_RESULTS.json for the actual run timestamp and versions. PostgreSQL **18.6**, PostGIS **3.6.2**:

- All 22 unchanged historical migrations executed on a fresh database.
- Before the fix, synthetic farmer A saw one field directly but two summary rows. Own zones returned zero rows. 46 application tables lacked RLS.
- The guarded forward migration executes successfully and the final table-name set equals docs/APPROVED_ENTITIES.txt exactly: 77 application tables, excluding extension-owned spatial_ref_sys.
- Fresh individual sequence (24 files): **59 core + 24 domain assertions passed**.
- Fresh generated apply_all.sql: **59 core + 24 domain assertions passed**.
- Nonempty user_roles and custom roles each abort reconciliation, preserve data and roll back the transaction.
- Test-run databases are deleted only after success. On failure the runner retains its own databases and writes their names into the result report.

The assertions cover table RLS coverage, invoker view settings, profile identity protection, two-user field/view isolation, cross-owner writes/reassignment/feedback, no-claim and anonymous denial, raw-pipeline access denial, positive zone/crop flows, area/centroid/perimeter, spatial intersections/indexes, geometry validity and containment, crop-variety FK consistency, date checks, reference data, timestamp correctness, and the valid-input Hargreaves helper. The domain suite inserts actual transactional label rows: calculated/model-derived ground-truth claims are rejected, valid observed-label fixtures are accepted, duplicate targets and cross-split duplicate snapshots are rejected. It also verifies crop-stage consistency, prediction-to-snapshot field identity, schedule/optimization/recommendation relationships, pump/zone ownership and parent-update protection.

## Reproduce on Windows

Requires Node.js and PostgreSQL with PostGIS installed. No application packages are needed. From the repository root, initialize the dedicated disposable cluster once:

```powershell
New-Item -ItemType Directory -Force ../.runtime | Out-Null
& 'C:\Program Files\PostgreSQL\18\bin\initdb.exe' -D '../.runtime/yuva-audit-pg' -U yuva_test_admin --auth=trust --encoding=UTF8 --locale=C --no-instructions
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D '../.runtime/yuva-audit-pg' -l '../.runtime/yuva-audit-pg.log' -o '-p 55432 -h 127.0.0.1' -w start
node scripts/build_migration_bundle.mjs --check
node scripts/verify_database.mjs
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D '../.runtime/yuva-audit-pg' -m fast -w stop
```

Do not initialize over an existing data directory. Start an existing test cluster using pg_ctl instead. This trust-auth cluster binds only to loopback, holds synthetic data, and should be stopped when testing ends. Do not put real credentials or user data in it. Windows sandbox token restrictions may require running pg_ctl outside the sandbox. The runner verifies data_directory before creating databases, never uses port 5432 and never connects to a remote host. YUVA_TEST_PSQL can select the psql executable.

To regenerate the aggregate after migration edits, run `node scripts/build_migration_bundle.mjs`. `--check` fails if it drifts. Do not apply both the bundle and the numbered sequence to the same database. Historical migrations are not generally replay-safe.

## Remaining gate before application work

- Establish real Supabase Auth/profile provisioning and test JWT/PostgREST behavior on a disposable Supabase project or full local stack. SQL claim simulation is not authentication validation.
- Finish cross-parent integrity coverage for executed irrigation events, hydraulic irrigation_zones, energy assets and satellite assets. Core crop/stage, system/farm, pump/system, schedule/zone/pump, recommendation and feature/prediction links are now constrained and tested; this is not exhaustive coverage of all 77 tables.
- Test/fix invalid-input scientific helper behavior, nullable deduplication keys, provenance defaults, deterministic view ranking and cycle alignment.
- Add broader tests for remaining seed semantics, field updates and farm coordinate consistency. Observed/calculated label-row tests now pass.
- Decide crop parameter variety/version uniqueness and overlapping crop-cycle semantics; do not silently choose assumptions for agronomic behavior.
- Configure migration history/deployment and pin the target Supabase PostgreSQL version. Local PG18 evidence does not establish PG15/17 deployment compatibility.

No weather, satellite, soil, ML or energy readings in these tests are production data. Fixtures are explicitly synthetic and rolled back. No external service, live database, model evaluation or hardware integration is claimed.

The domain-integrity migration also refuses a preexisting crop-stage/crop mismatch; a dedicated upgrade test verifies that the original row remains and new schema changes roll back. Existing inconsistent application data requires a deliberate correction workflow; the migration never silently replaces scientific observations.
