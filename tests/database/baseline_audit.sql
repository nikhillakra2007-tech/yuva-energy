-- Reproduce original a0cb603 defects in a disposable database. Rolls back fixtures.
-- Synthetic fixtures are authorization tests, never production observations.
BEGIN;
INSERT INTO public.users(id, auth_id, full_name) VALUES
('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','TEST farmer A'),
('00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','TEST farmer B');
INSERT INTO public.farms(id,user_id,name,location) VALUES
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','TEST farm A',ST_SetSRID(ST_Point(77,28),4326)),
('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','TEST farm B',ST_SetSRID(ST_Point(78,28),4326));
INSERT INTO public.fields(id,farm_id,name,boundary) VALUES
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','TEST field A',ST_GeomFromText('POLYGON((77 28,77.001 28,77.001 28.001,77 28.001,77 28))',4326)),
('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','TEST field B',ST_GeomFromText('POLYGON((78 28,78.001 28,78.001 28.001,78 28.001,78 28))',4326));
INSERT INTO public.field_zones(field_id,name) VALUES
('30000000-0000-0000-0000-000000000001','TEST zone');
-- Reproduce default broad grants separately from RLS configuration.
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
SELECT 'visible fields (expected 1)' AS check_name, count(*) FROM public.fields;
SELECT 'visible summary rows (expected 1; baseline leaks 2)' AS check_name, count(*) FROM public.v_current_field_state;
SELECT 'own zones (expected 1; baseline denies all)' AS check_name, count(*) FROM public.field_zones;
RESET ROLE;
SELECT 'application tables without RLS' AS check_name,count(*)
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity
AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e');
SELECT 'field geometry' AS check_name,GeometryType(boundary),ST_SRID(boundary),area_hectares,
ST_Equals(centroid,ST_Centroid(boundary)) AS correct_centroid FROM public.fields;
ROLLBACK;
