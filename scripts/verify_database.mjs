// Disposable local PostgreSQL/PostGIS verification. Never targets an existing app DB.
import { readFileSync, readdirSync, writeFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const psql = process.env.YUVA_TEST_PSQL || (process.platform === 'win32'
  ? 'C:/Program Files/PostgreSQL/18/bin/psql.exe' : 'psql');
const base = ['-X', '-q', '-A', '-t', '-h', '127.0.0.1', '-p', '55432', '-U', 'yuva_test_admin', '-w', '-v', 'ON_ERROR_STOP=1'];
function run(db, args, expectFailure = false) {
  const result = spawnSync(psql, [...base, '-d', db, ...args], { cwd: root, encoding: 'utf8', timeout: 60000 });
  if (result.error) throw result.error;
  if (expectFailure) {
    if (result.status === 0) throw new Error('Expected migration guard to fail');
    return result.stderr;
  }
  if (result.status !== 0) throw new Error(result.stderr || `psql exited ${result.status}`);
  return result.stdout.trim();
}
const query = (db, sql) => run(db, ['-c', sql]);
const executeFile = (db, file, fail = false) => run(db, ['-f', file], fail);
const expectedCluster = realpathSync(path.resolve(root, '../.runtime/yuva-audit-pg'));
const actualCluster = realpathSync(query('postgres', 'SHOW data_directory'));
if (expectedCluster.toLowerCase() !== actualCluster.toLowerCase()) {
  throw new Error('Refusing to test: port 55432 is not the isolated Yuva cluster');
}
const migrationDir = path.join(root, 'supabase/migrations');
const migrations = readdirSync(migrationDir).filter(f => /^\d+_.+\.sql$/.test(f)).sort();
const approved = readFileSync(path.join(root, 'docs/APPROVED_ENTITIES.txt'), 'utf8').replace(/^\uFEFF/, '').trim().split(/\s+/).sort();
const namesQuery = `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r' AND NOT EXISTS
(SELECT FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e') ORDER BY c.relname`;
const stamp = `${Date.now()}_${process.pid}`;
const results = { tested_at: new Date().toISOString(), scope: 'Disposable PostgreSQL with SQL auth shim; not Supabase Auth/JWT/PostgREST', suites: [] };
const created = [];
let success = false;
function create(suffix) {
  const db = `yuva_test_${stamp}_${suffix}`;
  if (!/^yuva_test_\d+_\d+_[a-z]+$/.test(db)) throw new Error('Invalid test database identifier');
  query('postgres', `CREATE DATABASE ${db}`);
  created.push(db);
  executeFile(db, 'tests/database/auth_shim.sql');
  return db;
}
try {
  const parity = spawnSync(process.execPath, ['scripts/build_migration_bundle.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  if (parity.status !== 0) throw new Error(parity.stderr);
  console.log(parity.stdout.trim());
  for (const mode of ['sequence', 'bundle']) {
    const db = create(mode);
    if (mode === 'sequence') for (const file of migrations) executeFile(db, path.join(migrationDir, file));
    else executeFile(db, 'supabase/migrations/apply_all.sql');
    const actual = query(db, namesQuery).split(/\r?\n/);
    if (JSON.stringify(actual) !== JSON.stringify(approved)) throw new Error(`${mode}: entity names differ from approved architecture`);
    const assertionOutput = executeFile(db, 'tests/database/regression.sql');
    const passed = Number(assertionOutput.trim().split(/\r?\n/).at(-1));
    if (!Number.isInteger(passed) || passed < 59) throw new Error(`${mode}: regression assertion count missing`);
    const domainOutput = executeFile(db, 'tests/database/domain_integrity.sql');
    const domainPassed = Number(domainOutput.trim().split(/\r?\n/).at(-1));
    if (!Number.isInteger(domainPassed) || domainPassed < 33) throw new Error(`${mode}: domain assertion count missing`);
    results.postgresql = query(db, 'SHOW server_version');
    results.postgis = query(db, 'SELECT postgis_lib_version()');
    results.suites.push({ name: mode, result: 'PASS', migrations: migrations.length, approved_entities: actual.length, assertions: passed, domain_assertions: domainPassed });
    console.log(`PASS ${mode}: ${actual.length} exact entities, ${passed} core + ${domainPassed} domain assertions`);
  }
  const db = create('guards');
  for (const file of migrations.filter(f => /^\d{3}_/.test(f))) executeFile(db, path.join(migrationDir, file));
  const forward = migrations.find(f => f.includes('reconcile_entities_and_tenant_security'));
  query(db, `INSERT INTO public.users(id,full_name) VALUES('00000000-0000-0000-0000-000000000001','TEST guard');
    INSERT INTO public.user_roles(user_id,role_id) SELECT '00000000-0000-0000-0000-000000000001',id FROM public.roles WHERE code='FARMER'`);
  const assignmentError = executeFile(db, path.join(migrationDir, forward), true);
  if (!assignmentError.includes('Role assignments exist') || query(db, 'SELECT count(*) FROM public.user_roles') !== '1'
      || query(db, "SELECT to_regclass('public.audit_logs') IS NULL") !== 't') throw new Error('Role assignment preservation failed');
  query(db, `DELETE FROM public.user_roles; INSERT INTO public.roles(code,name) VALUES('CUSTOM_TEST','TEST custom role')`);
  const customError = executeFile(db, path.join(migrationDir, forward), true);
  if (!customError.includes('Custom roles exist') || query(db, 'SELECT count(*) FROM public.roles') !== '6') throw new Error('Custom role preservation failed');
  results.suites.push({ name: 'upgrade_guards', result: 'PASS', cases: ['nonempty memberships preserved', 'custom roles preserved', 'failed migration rolls back'] });
  console.log('PASS upgrade guards: membership/custom-role data preserved, migration rolled back');
  const legacyDb = create('legacy');
  const integrityIndex = migrations.findIndex(f => f.includes('enforce_domain_relationship_integrity'));
  if (integrityIndex < 0) throw new Error('Domain integrity migration missing');
  for (const file of migrations.slice(0, integrityIndex)) executeFile(legacyDb, path.join(migrationDir, file));
  query(legacyDb, `INSERT INTO public.users(id,full_name) VALUES('00000000-0000-0000-0000-000000000001','TEST legacy');
    INSERT INTO public.farms(id,user_id,name) VALUES('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','TEST legacy');
    INSERT INTO public.fields(id,farm_id,name,boundary) VALUES('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','TEST legacy',ST_GeomFromText('POLYGON((77 28,77.001 28,77.001 28.001,77 28.001,77 28))',4326));
    INSERT INTO public.crop_cycles(id,field_id,crop_id,season,cycle_year,sowing_date) SELECT '40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',id,'RABI',2026,'2026-09-01' FROM public.crops WHERE code='WHEAT';
    INSERT INTO public.crop_stage_observations(crop_cycle_id,growth_stage_id,provenance) SELECT '40000000-0000-0000-0000-000000000001',s.id,'FARMER_CONFIRMED' FROM public.crop_growth_stages s JOIN public.crops c ON c.id=s.crop_id WHERE c.code='TOMATO' AND s.stage_code='INITIAL'`);
  const legacyError = executeFile(legacyDb, path.join(migrationDir, migrations[integrityIndex]), true);
  if (!legacyError.includes('fk_observation_stage_crop')
      || query(legacyDb, 'SELECT count(*) FROM public.crop_stage_observations') !== '1'
      || query(legacyDb, "SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='crop_stage_observations' AND column_name='crop_id'") !== '0') {
    throw new Error('Invalid legacy crop stage was not preserved transactionally');
  }
  results.suites.push({ name: 'legacy_integrity_guard', result: 'PASS', cases: ['invalid preexisting crop-stage relationship blocks migration', 'original row preserved', 'schema changes rolled back'] });
  console.log('PASS legacy integrity guard: incompatible data preserved and migration rolled back');
  success = true;
  results.result = 'PASS';
} catch (error) {
  results.result = 'FAIL';
  results.error = error.message;
  results.retained_test_databases = created;
  throw error;
} finally {
  if (success) {
    for (const db of created) query('postgres', `DROP DATABASE ${db}`);
    results.cleanup = 'Only databases created by this run were dropped';
  }
  writeFileSync(path.join(root, 'docs/DATABASE_TEST_RESULTS.json'), JSON.stringify(results, null, 2) + '\n');
}
