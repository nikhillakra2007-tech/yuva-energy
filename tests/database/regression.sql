-- Only synthetic transactional test data; never execute on production.
BEGIN;
CREATE TEMP TABLE assertions(label text NOT NULL);
GRANT INSERT,SELECT ON assertions TO authenticated,anon;
CREATE FUNCTION pg_temp.ok(condition boolean,label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF condition IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAILED: %',label; END IF;
 INSERT INTO assertions VALUES(label);
END $$;
CREATE FUNCTION pg_temp.expect_error(command text,expected_state text,label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE actual_state text;
BEGIN
 BEGIN EXECUTE command;
 EXCEPTION WHEN OTHERS THEN
   GET STACKED DIAGNOSTICS actual_state=RETURNED_SQLSTATE;
 END;
 PERFORM pg_temp.ok(actual_state=expected_state,label || ' SQLSTATE=' || coalesce(actual_state,'none'));
END $$;

SELECT pg_temp.ok((SELECT count(*)=77 AND bool_and(c.relrowsecurity) FROM pg_class c
 JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'
 AND NOT EXISTS(SELECT FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e')), '77 application tables all enable RLS');
SELECT pg_temp.ok(to_regclass('public.roles') IS NULL AND to_regclass('public.user_roles') IS NULL,'obsolete role tables removed');
SELECT pg_temp.ok((SELECT jsonb_array_length(details->'definitions')=5 FROM public.audit_logs WHERE action='SCHEMA_ROLE_CATALOG_RETIRED'),'role definitions retained in audit');
SELECT pg_temp.ok((SELECT count(*)=4 AND bool_and('security_invoker=true'=ANY(reloptions)) FROM pg_class WHERE oid IN
 ('public.v_current_field_state'::regclass,'public.v_latest_weather'::regclass,'public.v_latest_satellite_indices'::regclass,'public.v_active_irrigation_recommendations'::regclass)),'four invoker views');
SELECT pg_temp.ok((SELECT NOT prosecdef FROM pg_proc WHERE oid='public.current_app_user_id()'::regprocedure),'identity lookup does not bypass RLS');
SELECT pg_temp.ok((SELECT count(*)=6 FROM public.crops),'six crop reference rows');
SELECT pg_temp.ok((SELECT count(*)=12 FROM public.crop_growth_stages),'12 stage reference rows');
SELECT pg_temp.ok((SELECT count(*)=4 FROM public.crop_parameters),'four parameter reference rows');
SELECT pg_temp.ok((SELECT count(*)=7 FROM pg_indexes WHERE schemaname='public' AND indexdef LIKE '%USING gist%'),'seven spatial indexes');
SELECT pg_temp.ok((SELECT bool_and(convalidated) FROM pg_constraint WHERE connamespace='public'::regnamespace),'constraints validated');
SELECT pg_temp.ok(public.calculate_field_geodesic_area_hectares(NULL) IS NULL,'null area input handled');
SELECT pg_temp.ok(public.estimate_hargreaves_et0(25,20,30,15)=4.67,'Hargreaves valid-input numeric result');
SELECT pg_temp.ok(public.estimate_hargreaves_et0(NULL,20,30,15) IS NULL,'missing ET0 input returns null');

INSERT INTO public.users(id,auth_id,full_name) VALUES
 ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','TEST A'),
 ('00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','TEST B');
INSERT INTO public.farms(id,user_id,name,location) VALUES
 ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','TEST A',ST_GeomFromText('POINT(77 28)',4326)),
 ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','TEST B',ST_GeomFromText('POINT(78 28)',4326));
INSERT INTO public.fields(id,farm_id,name,boundary) VALUES
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','TEST A',ST_GeomFromText('POLYGON((77 28,77.001 28,77.001 28.001,77 28.001,77 28))',4326)),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','TEST B',ST_GeomFromText('POLYGON((78 28,78.001 28,78.001 28.001,78 28.001,78 28))',4326));
INSERT INTO public.recommendations(id,field_id,action_type,title,message_vernacular,action_window_start,action_window_end,confidence_score) VALUES
 ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','SKIP_IRRIGATION','TEST ONLY','TEST ONLY',now(),now(),0),
 ('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','SKIP_IRRIGATION','TEST ONLY','TEST ONLY',now(),now(),0);
INSERT INTO public.weather_observations(field_id,weather_source_id,observed_at,temperature_celsius)
 SELECT f.id,s.id,now(),20 FROM public.fields f CROSS JOIN public.weather_sources s WHERE s.code='OPEN_METEO';

SELECT pg_temp.ok((SELECT bool_and(GeometryType(location)='POINT' AND ST_SRID(location)=4326) FROM public.farms),'farm Point geometry');
SELECT pg_temp.ok((SELECT bool_and(GeometryType(boundary)='POLYGON' AND ST_SRID(boundary)=4326
 AND area_hectares=1.0900 AND ST_Equals(centroid,ST_Centroid(boundary)) AND perimeter_meters>400) FROM public.fields),'field geometry area centroid perimeter');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.fields WHERE ST_Intersects(boundary,ST_MakeEnvelope(76.999,27.999,77.002,28.002,4326))),'spatial intersection query');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub='10000000-0000-0000-0000-000000000001';
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.users),'A sees only own profile');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.farms),'A sees only own farm');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.fields),'A sees only own field');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.v_current_field_state),'summary view no longer leaks B');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.v_latest_weather),'weather view restricted to A');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.v_active_irrigation_recommendations),'recommendation view restricted to A');
SELECT pg_temp.ok((SELECT count(*)=0 FROM public.v_latest_satellite_indices),'satellite view executable with least privileges');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.weather_observations),'weather table restricted to A');
SELECT pg_temp.expect_error('SELECT * FROM public.raw_data_records','42501','raw pipeline data is private');
SELECT pg_temp.expect_error('UPDATE public.users SET auth_id=''10000000-0000-0000-0000-000000000002''','42501','cannot rewrite auth identity');
SELECT pg_temp.expect_error('UPDATE public.recommendations SET confidence_score=1','42501','cannot forge pipeline output');
SELECT pg_temp.expect_error('INSERT INTO public.farms(user_id,name) VALUES(''00000000-0000-0000-0000-000000000002'',''ATTACK'')','42501','cannot create farm for B');
SELECT pg_temp.expect_error('UPDATE public.farms SET user_id=''00000000-0000-0000-0000-000000000002''','42501','cannot reassign own farm to B');
SELECT pg_temp.expect_error('UPDATE public.fields SET farm_id=''20000000-0000-0000-0000-000000000002''','42501','cannot move field to B');
WITH changed AS (UPDATE public.fields SET name='ATTACK' WHERE id='30000000-0000-0000-0000-000000000002' RETURNING id)
SELECT pg_temp.ok((SELECT count(*)=0 FROM changed),'cross-owner update affects no rows');
WITH deleted AS (DELETE FROM public.fields WHERE id='30000000-0000-0000-0000-000000000002' RETURNING id)
SELECT pg_temp.ok((SELECT count(*)=0 FROM deleted),'cross-owner delete affects no rows');

INSERT INTO public.field_zones(id,field_id,name,boundary) VALUES
 ('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','TEST zone',ST_GeomFromText('POLYGON((77 28,77.0005 28,77.0005 28.0005,77 28.0005,77 28))',4326));
SELECT pg_temp.ok((SELECT count(*)=1 AND min(area_hectares)>0 FROM public.field_zones),'A can create/read computed field zone');
INSERT INTO public.crop_cycles(field_id,crop_id,season,cycle_year,sowing_date)
 SELECT '30000000-0000-0000-0000-000000000001',id,'RABI',2026,'2026-09-01' FROM public.crops WHERE code='WHEAT';
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.crop_cycles),'A can create/read own crop cycle');
SELECT pg_temp.expect_error('INSERT INTO public.crop_cycles(field_id,crop_id,season,cycle_year,sowing_date) SELECT ''30000000-0000-0000-0000-000000000002'',id,''RABI'',2026,''2026-09-01'' FROM public.crops WHERE code=''WHEAT''','42501','cannot plant on B field');
SELECT pg_temp.expect_error('INSERT INTO public.recommendation_feedback(recommendation_id,user_id,action_taken) VALUES(''40000000-0000-0000-0000-000000000002'',''00000000-0000-0000-0000-000000000001'',''DEFERRED'')','42501','cannot submit feedback on B recommendation');
INSERT INTO public.recommendation_feedback(recommendation_id,user_id,action_taken) VALUES
 ('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','DEFERRED');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.recommendation_feedback),'own recommendation feedback works');
INSERT INTO public.farmer_feedback(user_id,field_id,category,message) VALUES
 ('00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','APP_EXPERIENCE','TEST ONLY');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.farmer_feedback),'own general feedback works');
SELECT pg_temp.expect_error('INSERT INTO public.farmer_feedback(user_id,field_id,category,message) VALUES(''00000000-0000-0000-0000-000000000001'',''30000000-0000-0000-0000-000000000002'',''OTHER'',''ATTACK'')','42501','general feedback rejects B field');
UPDATE public.fields SET area_hectares=999;
SELECT pg_temp.ok((SELECT area_hectares=1.0900 FROM public.fields),'derived area cannot be forged');
SELECT pg_temp.expect_error('UPDATE public.fields SET boundary=ST_GeomFromText(''POLYGON EMPTY'',4326)','23514','empty polygon rejected');
SELECT pg_temp.expect_error('UPDATE public.fields SET boundary=ST_GeomFromText(''POLYGON((77 28,77.001 28.001,77.001 28,77 28.001,77 28))'',4326)','23514','self-intersecting polygon rejected');
SELECT pg_temp.expect_error('UPDATE public.fields SET boundary=ST_GeomFromText(''POLYGON((181 28,182 28,182 29,181 29,181 28))'',4326)','23514','out-of-range polygon rejected');
SELECT pg_temp.expect_error('UPDATE public.field_zones SET boundary=ST_GeomFromText(''POLYGON((78 28,78.001 28,78.001 28.001,78 28.001,78 28))'',4326)','23514','zone outside field rejected');
SELECT pg_temp.expect_error('UPDATE public.fields SET boundary=ST_GeomFromText(''POLYGON((78 28,78.001 28,78.001 28.001,78 28.001,78 28))'',4326)','23514','field cannot abandon existing zone');

SET LOCAL request.jwt.claim.sub='10000000-0000-0000-0000-000000000002';
SELECT pg_temp.ok((SELECT count(*)=1 AND min(name)='TEST B' FROM public.fields),'B independently sees only B');
SELECT pg_temp.ok((SELECT count(*)=0 FROM public.field_zones),'B cannot read A zone');
SELECT pg_temp.ok((SELECT count(*)=0 FROM public.crop_cycles),'B cannot read A crop cycle');
SELECT pg_temp.ok((SELECT count(*)=0 FROM public.farmer_feedback),'B cannot read A feedback');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.v_current_field_state),'B summary isolated');
SET LOCAL request.jwt.claim.sub='';
SELECT pg_temp.ok((SELECT count(*)=0 FROM public.fields),'authenticated role without claims sees no fields');
RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.expect_error('SELECT * FROM public.fields','42501','anonymous fields denied');
SELECT pg_temp.expect_error('SELECT * FROM public.v_current_field_state','42501','anonymous summary denied');
SELECT pg_temp.expect_error('SELECT public.current_app_user_id()','42501','anonymous identity helper denied');
RESET ROLE;

INSERT INTO public.crop_varieties(id,crop_id,code,name) SELECT '60000000-0000-0000-0000-000000000001',id,'TEST','TEST tomato variety' FROM public.crops WHERE code='TOMATO';
SELECT pg_temp.expect_error('UPDATE public.crop_cycles SET crop_variety_id=''60000000-0000-0000-0000-000000000001''','23503','mismatched crop variety rejected even for server');
SELECT pg_temp.expect_error('UPDATE public.crop_cycles SET actual_harvest_date=''2026-08-01''','23514','harvest before sowing rejected');
SET LOCAL TIME ZONE 'Asia/Kolkata';
INSERT INTO public.users(full_name) VALUES('TEST timestamp');
SELECT pg_temp.ok((SELECT abs(extract(epoch FROM (created_at-now())))<1 FROM public.users WHERE full_name='TEST timestamp'),'timestamptz defaults preserve instant in local timezone');
UPDATE public.users SET full_name=full_name WHERE full_name='TEST timestamp';
SELECT pg_temp.ok((SELECT abs(extract(epoch FROM (updated_at-now())))<1 FROM public.users WHERE full_name='TEST timestamp'),'updated_at trigger preserves instant');
SELECT pg_temp.ok((SELECT pg_get_constraintdef(oid) LIKE '%OBSERVED%' FROM pg_constraint WHERE conname='chk_target_ground_truth'),'ground truth limited to observed labels');

SELECT count(*) AS passed_assertions FROM assertions;
ROLLBACK;
