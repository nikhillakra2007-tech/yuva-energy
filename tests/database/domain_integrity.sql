-- Synthetic fixtures only. All changes are rolled back.
BEGIN;
CREATE TEMP TABLE assertions(label text NOT NULL);
CREATE FUNCTION pg_temp.ok(condition boolean,label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF condition IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAILED: %',label; END IF;
 INSERT INTO assertions VALUES(label);
END $$;
CREATE FUNCTION pg_temp.expect_error(command text,expected_state text,label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE actual_state text;
BEGIN
 BEGIN EXECUTE command;
 EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS actual_state=RETURNED_SQLSTATE; END;
 PERFORM pg_temp.ok(actual_state=expected_state,label || ' SQLSTATE=' || coalesce(actual_state,'none'));
END $$;

INSERT INTO public.users(id,full_name) VALUES('00000000-0000-0000-0000-000000000001','TEST A'),('00000000-0000-0000-0000-000000000002','TEST B');
INSERT INTO public.farms(id,user_id,name) VALUES
 ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','TEST A'),
 ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','TEST B');
INSERT INTO public.fields(id,farm_id,name,boundary) VALUES
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','TEST A',ST_GeomFromText('POLYGON((77 28,77.001 28,77.001 28.001,77 28.001,77 28))',4326)),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','TEST B',ST_GeomFromText('POLYGON((78 28,78.001 28,78.001 28.001,78 28.001,78 28))',4326));
INSERT INTO public.crop_cycles(id,field_id,crop_id,season,cycle_year,sowing_date)
 SELECT '40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',id,'RABI',2026,'2026-09-01' FROM public.crops WHERE code='WHEAT';
INSERT INTO public.crop_stage_observations(crop_cycle_id,growth_stage_id,provenance)
 SELECT '40000000-0000-0000-0000-000000000001',s.id,'FARMER_CONFIRMED' FROM public.crop_growth_stages s JOIN public.crops c ON s.crop_id=c.id WHERE c.code='WHEAT' AND s.stage_code='INITIAL';
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.crop_stage_observations),'valid crop stage accepted');
SELECT pg_temp.expect_error('UPDATE public.crop_stage_observations SET growth_stage_id=(SELECT s.id FROM public.crop_growth_stages s JOIN public.crops c ON s.crop_id=c.id WHERE c.code=''TOMATO'' AND s.stage_code=''INITIAL'')','23503','mismatched growth stage rejected');
SELECT pg_temp.expect_error('UPDATE public.crop_cycles SET crop_id=(SELECT id FROM public.crops WHERE code=''TOMATO'')','23503','parent crop change cannot invalidate existing stages');

INSERT INTO public.irrigation_systems(id,farm_id,field_id,irrigation_method_id,water_source_id,name)
 SELECT '50000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',m.id,w.id,'TEST system' FROM public.irrigation_methods m CROSS JOIN public.water_sources w WHERE m.code='DRIP_SURFACE' AND w.code='BOREWELL_DEEP';
SELECT pg_temp.expect_error('UPDATE public.irrigation_systems SET field_id=''30000000-0000-0000-0000-000000000002''','23503','system cannot reference another farm field');
INSERT INTO public.pumps(id,farm_id,irrigation_system_id,name,pump_type) VALUES
 ('60000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','TEST pump A','SUBMERSIBLE'),
 ('60000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',NULL,'TEST pump B','SUBMERSIBLE');
SELECT pg_temp.expect_error('UPDATE public.pumps SET farm_id=''20000000-0000-0000-0000-000000000002'' WHERE id=''60000000-0000-0000-0000-000000000001''','23503','pump cannot mismatch system farm');

INSERT INTO public.feature_snapshots(id,field_id,crop_cycle_id,snapshot_at,feature_values,data_completeness_ratio) VALUES
 ('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',now(),'{}',0);
SELECT pg_temp.expect_error('UPDATE public.feature_snapshots SET field_id=''30000000-0000-0000-0000-000000000002''','23503','snapshot cannot mismatch crop cycle field');
INSERT INTO public.training_datasets(id,dataset_name,version_tag,target_task) VALUES
 ('80000000-0000-0000-0000-000000000001','TEST ONLY','test-integrity','WATER_REQUIREMENT_REGRESSION');
INSERT INTO public.training_examples(id,training_dataset_id,feature_snapshot_id,dataset_split) VALUES
 ('90000000-0000-0000-0000-000000000001','80000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','TRAIN');
INSERT INTO public.training_targets(training_example_id,target_code,target_value_numeric,target_type,generation_methodology,target_timestamp,provenance,is_ground_truth) VALUES
 ('90000000-0000-0000-0000-000000000001','TEST_MM',3,'CALCULATED','synthetic regression fixture',now(),'CALCULATED',false);
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.training_targets),'calculated non-ground-truth label accepted');
SELECT pg_temp.expect_error('UPDATE public.training_targets SET is_ground_truth=true','23514','calculated label cannot become ground truth');
SELECT pg_temp.expect_error('UPDATE public.training_targets SET target_type=''MODEL_DERIVED'',is_ground_truth=true','23514','model-derived label cannot become ground truth');
UPDATE public.training_targets SET target_type='OBSERVED',provenance='TEST_SYNTHETIC',is_ground_truth=true;
SELECT pg_temp.ok((SELECT bool_and(is_ground_truth) FROM public.training_targets),'observed label path accepts synthetic test fixture');
SELECT pg_temp.expect_error('UPDATE public.training_targets SET target_value_class=''IRRIGATE_NOW''','23514','target cannot have numeric and class values together');
SELECT pg_temp.expect_error('UPDATE public.training_targets SET target_value_numeric=NULL','23514','target value cannot be absent');
SELECT pg_temp.expect_error('INSERT INTO public.training_targets(training_example_id,target_code,target_value_numeric,target_type,generation_methodology,target_timestamp,provenance) SELECT training_example_id,target_code,1,''CALCULATED'',''TEST duplicate'',now(),''CALCULATED'' FROM public.training_targets','23505','duplicate target for the same example rejected');
SELECT pg_temp.expect_error('INSERT INTO public.training_examples(training_dataset_id,feature_snapshot_id,dataset_split) VALUES(''80000000-0000-0000-0000-000000000001'',''70000000-0000-0000-0000-000000000001'',''TEST'')','23505','same snapshot cannot leak across dataset splits');

INSERT INTO public.model_versions(id,model_name,task_type,version_tag,algorithm_family) VALUES
 ('a0000000-0000-0000-0000-000000000001','TEST ONLY','REGRESSION','test','TEST_ONLY');
INSERT INTO public.predictions(id,field_id,model_version_id,feature_snapshot_id,target_task,predicted_numeric_value) VALUES
 ('b0000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','WATER_REQUIREMENT_REGRESSION',0);
SELECT pg_temp.expect_error('UPDATE public.predictions SET field_id=''30000000-0000-0000-0000-000000000002''','23503','prediction cannot use another field snapshot');
INSERT INTO public.optimization_runs(id,field_id,prediction_id,primary_objective,status) VALUES
 ('c0000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','GRID_COST_MIN','RUNNING');
SELECT pg_temp.expect_error('UPDATE public.optimization_runs SET field_id=''30000000-0000-0000-0000-000000000002''','23503','optimization cannot use another field prediction');
INSERT INTO public.irrigation_schedules(id,optimization_run_id,field_id,valid_from,valid_to,total_water_volume_litres,total_water_depth_mm,estimated_energy_kwh) VALUES
 ('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',now(),now()+interval '1 hour',0,0,0);
SELECT pg_temp.expect_error('UPDATE public.irrigation_schedules SET field_id=''30000000-0000-0000-0000-000000000002''','23503','schedule cannot mismatch optimization field');
INSERT INTO public.field_zones(id,field_id,name) VALUES
 ('e0000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','TEST A'),
 ('e0000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','TEST B');
INSERT INTO public.irrigation_schedule_items(irrigation_schedule_id,field_zone_id,pump_id,planned_start_time,planned_end_time,planned_duration_minutes,target_depth_mm,target_volume_litres,planned_energy_source)
 VALUES('d0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001',now(),now()+interval '1 minute',1,0,0,'SOLAR_PV');
SELECT pg_temp.ok((SELECT field_id='30000000-0000-0000-0000-000000000001' AND farm_id='20000000-0000-0000-0000-000000000001' FROM public.irrigation_schedule_items),'schedule identity derived from parent');
SELECT pg_temp.expect_error('UPDATE public.irrigation_schedule_items SET field_zone_id=''e0000000-0000-0000-0000-000000000002''','23503','schedule item rejects other field zone');
SELECT pg_temp.expect_error('UPDATE public.irrigation_schedule_items SET pump_id=''60000000-0000-0000-0000-000000000002''','23503','schedule item rejects other farm pump');
SELECT pg_temp.expect_error('UPDATE public.pumps SET farm_id=''20000000-0000-0000-0000-000000000002'',irrigation_system_id=NULL WHERE id=''60000000-0000-0000-0000-000000000001''','23503','parent pump cannot move away from existing schedule');
SELECT pg_temp.expect_error('UPDATE public.field_zones SET field_id=''30000000-0000-0000-0000-000000000002'' WHERE id=''e0000000-0000-0000-0000-000000000001''','23503','parent zone cannot move away from existing schedule');
INSERT INTO public.recommendations(field_id,irrigation_schedule_id,optimization_run_id,action_type,title,message_vernacular,action_window_start,action_window_end,confidence_score) VALUES
 ('30000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','SKIP_IRRIGATION','TEST ONLY','TEST ONLY',now(),now(),0);
SELECT pg_temp.expect_error('UPDATE public.recommendations SET field_id=''30000000-0000-0000-0000-000000000002''','23503','recommendation cannot mismatch linked field');
SELECT pg_temp.ok((SELECT count(*)=1 FROM public.recommendations),'valid recommendation linkage retained');

-- Executed irrigation events cross-parent integrity
INSERT INTO public.irrigation_events(id,field_id,irrigation_system_id,pump_id,started_at)
 VALUES('f0000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001',now());
SELECT pg_temp.ok((SELECT farm_id='20000000-0000-0000-0000-000000000001' FROM public.irrigation_events WHERE id='f0000000-0000-0000-0000-000000000001'),'irrigation event farm derived');
SELECT pg_temp.expect_error('UPDATE public.irrigation_events SET pump_id=''60000000-0000-0000-0000-000000000002'' WHERE id=''f0000000-0000-0000-0000-000000000001''','23503','event cannot use pump from other farm');
SELECT pg_temp.expect_error('INSERT INTO public.water_measurements(irrigation_event_id,field_id,measurement_type,volume_cubic_meters,volume_litres,provenance) VALUES(''f0000000-0000-0000-0000-000000000001'',''30000000-0000-0000-0000-000000000002'',''PHYSICAL_FLOW_METER'',1,1000,''MEASURED'')','23503','water measurement cannot mismatch event field');

-- Energy systems & assets cross-parent integrity
INSERT INTO public.energy_systems(id,farm_id,name,primary_source_id)
 SELECT 'f1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','TEST energy',id FROM public.energy_sources WHERE code='GRID_3_PHASE' OR is_renewable IS NOT NULL LIMIT 1;
INSERT INTO public.energy_assets(id,energy_system_id,pump_id,name,asset_type)
 VALUES('f2000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','TEST inverter','SOLAR_PUMP_INVERTER');
SELECT pg_temp.ok((SELECT farm_id='20000000-0000-0000-0000-000000000001' FROM public.energy_assets WHERE id='f2000000-0000-0000-0000-000000000001'),'energy asset farm derived');
SELECT pg_temp.expect_error('UPDATE public.energy_assets SET pump_id=''60000000-0000-0000-0000-000000000002'' WHERE id=''f2000000-0000-0000-0000-000000000001''','23503','energy asset cannot link to pump of other farm');
INSERT INTO public.energy_systems(id,farm_id,name,primary_source_id)
 SELECT 'f1000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','TEST energy B',id FROM public.energy_sources WHERE code='GRID_3_PHASE' OR is_renewable IS NOT NULL LIMIT 1;
SELECT pg_temp.expect_error('INSERT INTO public.energy_observations(energy_system_id,asset_id,observed_at) VALUES(''f1000000-0000-0000-0000-000000000002'',''f2000000-0000-0000-0000-000000000001'',now())','23503','observation rejects asset from other system');

-- Satellite asset integrity
INSERT INTO public.satellite_scenes(id,collection_id,provider_scene_id,acquired_at)
 SELECT 'f3000000-0000-0000-0000-000000000001',id,'TEST_SCENE_1',now() FROM public.satellite_collections LIMIT 1;
INSERT INTO public.satellite_observations(id,field_id,scene_id,acquired_at)
 VALUES('f4000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001',now());
SELECT pg_temp.expect_error('INSERT INTO public.satellite_assets(satellite_observation_id,field_id,asset_type,storage_path) VALUES(''f4000000-0000-0000-0000-000000000001'',''30000000-0000-0000-0000-000000000002'',''NDVI_MAP'',''/test/ndvi.tif'')','23503','satellite asset rejects mismatching observation field');

-- Hardened scientific calculation check
SELECT pg_temp.ok(public.estimate_hargreaves_et0(25,30,20,15) IS NULL,'Hargreaves rejects unphysical t_max < t_min');
SELECT pg_temp.ok(public.estimate_hargreaves_et0(25,20,30,-5) IS NULL,'Hargreaves rejects negative radiation');

SELECT count(*) AS passed_assertions FROM assertions;
ROLLBACK;
