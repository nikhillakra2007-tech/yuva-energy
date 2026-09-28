# Implementation audit

Audit baseline: `a0cb60303369a7ca86d1632b7fc52899b4b41a51`, main, 2026-09-28. Local and fetched origin/main matched; working tree was clean. This is a source audit, not a claim of a working application. Runtime results are recorded separately as they become available.

## Scope and evidence

Read AGENTS.md, the stop-and-save protocol, progress report, master database specification, .gitignore, all 22 numbered migrations, and the combined bundle. Reviewed all three historical commits. The seed-fix commit corrected tomato values and crop uniqueness constraints; history contains no test results. Inventory: 77 tables, 39 explicit indexes, 5 functions, 12 triggers, 26 policies, 31 RLS-enabled tables and 4 views. PostgreSQL 18 binaries and PostGIS 3.6.2 extension files are available locally. The existing server responds on port 5432; no access to its data is needed for isolated verification.

The bundle contains the same SQL as the numbered migrations except mojibake in the SoilGrids attribution string (`ISRIC —` versus `ISRIC â€”`). Numerous comments also have encoding damage. It must be reproducibly generated, not hand-edited separately.

## Implemented versus planned

| Component | Actual baseline state | Verification at audit checkpoint |
| --- | --- | --- |
| Database DDL | 22 SQL migrations, foreign keys, range checks, indexes, seeds | Source inspected; runtime pending |
| Spatial helpers | Polygon area/perimeter/centroid trigger and area function | Runtime pending |
| Agricultural helper | Hargreaves ET0 SQL fallback only | Units and invalid-input behavior need tests |
| Security | Partial RLS and auth-ID lookup function | Incomplete; findings below |
| Views | Four SQL dashboard projections | Not an API or UI; runtime pending |
| Weather, satellite, soil | Tables plus provider registrations | No requests, parsing, retries or data ingestion |
| Agriculture | Storage schema and documented formulas | No water-balance engine |
| Features and ML | Storage schema and documented design | No features, labels, models, training or metrics |
| Optimization and advice | Storage schema | No solver, schedules or recommendation service |
| Auth, backend, frontend | Absent | No end-to-end user flow |
| Notifications/hardware | Channel registrations only | No delivery or hardware integration |
| Tests/deployment | No baseline tests, manifests, CI or deployment configuration | Not verified |

## 77-entity reconciliation and role dependency decision

The approved list in MASTER_IMPLEMENTATION_PROMPT.md contains 77 unique application entities. Baseline has 75 of those plus `roles` and `user_roles`; missing are `farmer_feedback` and `audit_logs`. Counts alone concealed this mismatch.

Role dependencies: migration 002 creates both tables and the role/user foreign keys; 019 attaches the roles timestamp trigger; 020 enables roles RLS and public read; 021 seeds five role definitions. The bundle duplicates these, and the specification lists them. No RLS ownership predicate, function body, view, or application code uses role membership. `current_app_user_id()` depends on users and auth.uid(), not roles. The role tables are unnecessary for the approved farmer-ownership model.

Decision: preserve historical migrations; use a forward migration to remove roles and user_roles only after checking that no assignment rows or customized role data would be lost. Do not use CASCADE to hide unknown dependencies. Existing deployments with assignments must stop for an explicit data-mapping decision. Add farmer_feedback for general field/app feedback, distinct from recommendation_feedback, and audit_logs for controlled metadata-only audit events. No privileged authorization values belong in user-editable users.metadata. Final application table inventory must match all 77 names, excluding extension-owned objects such as spatial_ref_sys.

## Findings requiring correction or a verification gate

1. **High: incomplete RLS coverage.** 46 baseline tables lack RLS, including weather observations, satellite observations, soil, intelligence, ML, schedules and pipeline internals. Exposure depends on grants, which the migrations do not control. Existing Supabase defaults can make these accessible.
2. **High: owner-executed views.** All four views omit security_invoker. If granted to clients, they can bypass base-table RLS. Use invoker views with explicit grants and multi-user tests.
3. **High: insufficient relationship authorization.** Recommendation feedback checks submitting user, not ownership of the referenced recommendation. Independent foreign keys do not prove a crop variety belongs to the selected crop or a pump/zone/system belongs to the same holding. Tests must cover cross-owner links and reassignment.
4. **High: unsafe identity/profile surface.** current_app_user_id is a publicly callable SECURITY DEFINER function without a fixed search_path. Profile updates are not restricted to editable columns; auth_id is mutable if UPDATE grants are broad. Use a non-recursive invoker lookup and restricted profile grants.
5. **Functional: policies deny legitimate flows.** field_zones, crop_cycles, irrigation systems, pumps and several energy tables enable RLS without policies. Farmer inserts/reads will fail even with grants. No user provisioning policy/trigger exists.
6. **Spatial integrity:** correct Point/Polygon typmods and GiST indexes exist, but validity, empty geometry, coordinate bounds and zone containment checks are absent. Field zone areas and farm coordinates are not synchronized. Direct edits can change derived field area without changing boundary.
7. **Provenance/labels:** training_targets forbids MODEL_DERIVED ground truth but permits CALCULATED ground truth. Features and raw records are called immutable without enforcement. Several tables have no row-level provenance and lineage references are polymorphic, not foreign keys.
8. **Ingestion deduplication:** weather_observations has no natural-key uniqueness; forecast runs have no unique provider run identifier. Nullable field IDs weaken forecast uniqueness. Unit/time-resolution contracts are not defined.
9. **Numerical/scientific:** Hargreaves changes nonpositive temperature differences to 0.1 instead of distinguishing invalid inputs. Soil hydraulic ordering, fractions summing to 100, water-balance consistency and timestamp windows need checks. Constants are generic seed assumptions, not verified local measurements.
10. **Defaults imply unearned evidence:** recommendation confidence defaults to 0.850; source reliability to 0.95; optimizer status defaults COMPLETED and constraint status true. Applications must supply real computed outcomes; remove misleading defaults before those pipelines are built.
11. **Crop/reference consistency:** crop cycle variety and growth-stage crop can disagree; multiple ACTIVE cycles per field are allowed, which can duplicate the summary view. Per-variety crop parameters cannot coexist under the current crop/version unique key. Energy source code on pumps does not reference the source catalog.
12. **View semantics:** recommendation urgency sorts alphabetically, not CRITICAL/HIGH/MEDIUM/LOW. The selected pump has no deterministic ordering. Latest state/stage queries need deterministic tie handling and cycle alignment.
13. **Migration reproducibility:** CREATE POLICY is not replay-safe, IF NOT EXISTS does not validate an existing table's shape, no migration ledger exists, and applying both numbered migrations and apply_all.sql would duplicate work. Test fresh sequence and bundle separately; establish deployment tracking before production.
14. **Timestamp semantics:** timezone('utc', now()) yields a timestamp without time zone that can be reinterpreted in a non-UTC session when assigned to timestamptz. Prefer now() and test in Asia/Kolkata.

## Dependencies and next gate

Runtime requires PostgreSQL, PostGIS, pgcrypto, uuid-ossp and the Supabase auth.uid() function/roles. Isolated tests may supply a clearly marked auth shim; that does not test Supabase JWT validation, Auth or PostgREST. No Python/Node project dependencies are declared. No provider credentials are configured. No production observations, measured labels or validated ML metrics exist in the repository.

Before backend implementation: run a fresh isolated database, reproduce defects, reconcile entities using guarded forward changes, test ownership with two users plus anonymous access, validate geometry/triggers/views/seeds, and document remaining failures. Never apply test fixtures to a user's live database.

Security reference consulted: [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security). The changelog markdown fetch was attempted but the browser rejected its content type; retrieve it by HTTPS before implementing Supabase-specific changes.

## Runtime follow-up (2026-09-29 IST)

The initial audit above is retained as baseline evidence. See DATABASE_VERIFICATION.md and DATABASE_TEST_RESULTS.json for current runtime scope. Forward reconciliation now yields the exact approved 77 entities; role catalog definitions are preserved in audit_logs and membership/custom-role removal is guarded. All application tables enable RLS, the four views use caller permissions, identity updates are column-restricted, and core farmer/field/zone/crop/feedback isolation is tested. Timestamp defaults, invalid field/zone geometry and crop-variety mismatch checks were added. This resolves the reproduced view leak and missing zone access in the covered cases. Other findings remain open as listed in DATABASE_VERIFICATION.md; no full application/database-completion claim is made.

Changelog follow-up: HTTPS retrieval succeeded. The 2026-09-25 notice about legacy pgcrypto ciphers, ltree/btree_gist indexes and custom operators was reviewed; no such application usage exists in the baseline SQL. PostgreSQL 18.6/PostGIS 3.6.2 was used for local verification.

## Domain-integrity follow-up

Forward migration 20260928191601_enforce_domain_relationship_integrity.sql adds composite foreign keys for crop-stage compatibility; crop-cycle fields on scientific/feature records; irrigation-system field/farm identity; pump/system farm identity; prediction/snapshot fields; optimization/prediction fields; schedule/optimization fields; recommendation schedule/run/field identity; and vegetation-index observation fields. Schedule items derive field/farm identity and constrain their zone/pump parents. Parent reassignment is blocked by the same foreign keys. Training labels now require exactly one value and unique example/target-code pairs; a snapshot cannot appear in different splits of one dataset. Actual label-row tests cover calculated/model-derived ground-truth rejection. Existing mismatched crop-stage data blocks migration and is preserved. Executed irrigation event links, hydraulic zones, energy/satellite assets, numerical/provenance and real Supabase gates remain open.
