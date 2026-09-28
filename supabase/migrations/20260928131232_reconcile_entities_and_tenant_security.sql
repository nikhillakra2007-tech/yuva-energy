-- Forward-only reconciliation; preserve 001-022 as historical migrations.
-- Generated with Supabase CLI 2.118.0. Apply transactionally.
BEGIN;

-- Never discard live memberships. Unknown dependencies will also fail DROP RESTRICT.
DO $$ BEGIN
  IF EXISTS (SELECT FROM public.user_roles) THEN
    RAISE EXCEPTION 'Role assignments exist; map and preserve them before reconciliation';
  END IF;
  IF EXISTS (SELECT FROM public.roles WHERE code NOT IN ('FARMER','AGRONOMIST','ADMIN','RESEARCHER','SYSTEM')) THEN
    RAISE EXCEPTION 'Custom roles exist; an explicit authorization migration is required';
  END IF;
END $$;

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (length(action) BETWEEN 1 AND 100),
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details)='object'),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.audit_logs IS 'Server-written metadata audit; never store credentials or raw personal-data snapshots.';
CREATE INDEX idx_audit_actor_time ON public.audit_logs(actor_user_id,occurred_at DESC);
CREATE INDEX idx_audit_entity_time ON public.audit_logs(entity_type,entity_id,occurred_at DESC);

-- Preserve retiring reference definitions, including names/descriptions/timestamps.
INSERT INTO public.audit_logs(action,entity_type,details)
SELECT 'SCHEMA_ROLE_CATALOG_RETIRED','roles',jsonb_build_object('definitions',coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb))
FROM public.roles r;
DROP TABLE public.user_roles RESTRICT;
DROP TABLE public.roles RESTRICT;

CREATE TABLE public.farmer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  field_id uuid REFERENCES public.fields(id) ON DELETE RESTRICT,
  category text NOT NULL CHECK (category IN ('APP_EXPERIENCE','FIELD_CONDITION','DATA_CORRECTION','OTHER')),
  message text NOT NULL CHECK (length(btrim(message)) BETWEEN 1 AND 4000),
  rating integer CHECK (rating BETWEEN 1 AND 5),
  provenance text NOT NULL DEFAULT 'USER_PROVIDED' CHECK (provenance='USER_PROVIDED'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_farmer_feedback_user_time ON public.farmer_feedback(user_id,created_at DESC);
CREATE INDEX idx_farmer_feedback_field ON public.farmer_feedback(field_id);

-- Exact project table allowlist. Never change extension-owned or unrelated tables.
DO $$
DECLARE t text; p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','farms','fields','field_zones','administrative_areas','crops','crop_varieties','crop_cycles',
    'crop_growth_stages','crop_stage_observations','crop_parameters','crop_production_statistics',
    'weather_sources','weather_locations','weather_observations','weather_forecast_runs','weather_forecasts',
    'satellite_sources','satellite_collections','satellite_scenes','satellite_processing_runs','satellite_observations','vegetation_indices','satellite_assets',
    'soil_sources','soil_observations','soil_samples','soil_moisture_observations',
    'water_sources','irrigation_methods','irrigation_systems','irrigation_zones','pumps','irrigation_events','water_measurements',
    'energy_sources','energy_systems','energy_assets','energy_observations','energy_tariffs','energy_forecasts',
    'farm_states','evapotranspiration_calculations','soil_water_balance','water_requirement_calculations','water_stress_estimates',
    'feature_definitions','feature_snapshots','training_datasets','training_examples','training_targets','model_versions','model_training_runs','model_metrics','model_artifacts','predictions','prediction_explanations',
    'optimization_runs','optimization_constraints','irrigation_schedules','irrigation_schedule_items',
    'recommendations','recommendation_reasons','recommendation_feedback','data_sources','data_source_endpoints','ingestion_jobs','ingestion_runs','raw_data_records','processing_runs','data_quality_checks','data_lineage',
    'notification_channels','notifications','user_preferences','farmer_feedback','audit_logs'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,t);
    END LOOP;
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated',t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
  END LOOP;
END $$;

-- Direct users policy avoids recursion; no SECURITY DEFINER is necessary.
CREATE POLICY own_user_read ON public.users FOR SELECT TO authenticated USING (auth_id=(SELECT auth.uid()));
CREATE POLICY own_user_update ON public.users FOR UPDATE TO authenticated
  USING (auth_id=(SELECT auth.uid())) WITH CHECK (auth_id=(SELECT auth.uid()));
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE(full_name,phone_number,preferred_language) ON public.users TO authenticated;
CREATE OR REPLACE FUNCTION public.current_app_user_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT id FROM public.users WHERE auth_id=(SELECT auth.uid()) AND is_active LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO authenticated,service_role;

-- Catalogs are readable by signed-in farmers. Writes are server-only.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['administrative_areas','crops','crop_varieties','crop_growth_stages','crop_parameters',
    'crop_production_statistics','weather_sources','weather_locations','satellite_sources','satellite_collections',
    'soil_sources','water_sources','irrigation_methods','energy_sources','notification_channels','feature_definitions'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
    EXECUTE format('CREATE POLICY catalog_read ON public.%I FOR SELECT TO authenticated USING (true)',t);
  END LOOP;
END $$;

CREATE POLICY own_farms ON public.farms FOR ALL TO authenticated
 USING (user_id=(SELECT public.current_app_user_id())) WITH CHECK (user_id=(SELECT public.current_app_user_id()));
CREATE POLICY own_fields ON public.fields FOR ALL TO authenticated
 USING (farm_id IN (SELECT id FROM public.farms)) WITH CHECK (farm_id IN (SELECT id FROM public.farms));
CREATE POLICY own_zones ON public.field_zones FOR ALL TO authenticated
 USING (field_id IN (SELECT id FROM public.fields)) WITH CHECK (field_id IN (SELECT id FROM public.fields));
CREATE POLICY own_cycles ON public.crop_cycles FOR ALL TO authenticated
 USING (field_id IN (SELECT id FROM public.fields)) WITH CHECK (field_id IN (SELECT id FROM public.fields));
CREATE POLICY own_preferences ON public.user_preferences FOR ALL TO authenticated
 USING (user_id=(SELECT public.current_app_user_id())) WITH CHECK (user_id=(SELECT public.current_app_user_id()));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.farms,public.fields,public.field_zones,public.crop_cycles,public.user_preferences TO authenticated;

-- Pipeline outputs are farmer-readable but never client writable.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['weather_observations','weather_forecasts','satellite_observations','vegetation_indices','satellite_assets',
    'soil_observations','soil_samples','soil_moisture_observations','irrigation_events','water_measurements',
    'farm_states','evapotranspiration_calculations','soil_water_balance','water_requirement_calculations','water_stress_estimates',
    'feature_snapshots','predictions','optimization_runs','irrigation_schedules','recommendations'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
    EXECUTE format('CREATE POLICY own_field_read ON public.%I FOR SELECT TO authenticated USING (field_id IN (SELECT id FROM public.fields))',t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['irrigation_systems','pumps','energy_systems'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
    EXECUTE format('CREATE POLICY own_farm_read ON public.%I FOR SELECT TO authenticated USING (farm_id IN (SELECT id FROM public.farms))',t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['energy_assets','energy_observations','energy_tariffs','energy_forecasts'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
    EXECUTE format('CREATE POLICY own_energy_read ON public.%I FOR SELECT TO authenticated USING (energy_system_id IN (SELECT id FROM public.energy_systems))',t);
  END LOOP;
END $$;
CREATE POLICY own_stages_read ON public.crop_stage_observations FOR SELECT TO authenticated USING (crop_cycle_id IN (SELECT id FROM public.crop_cycles));
CREATE POLICY own_irrigation_zones_read ON public.irrigation_zones FOR SELECT TO authenticated
 USING (field_zone_id IN (SELECT id FROM public.field_zones) AND irrigation_system_id IN (SELECT id FROM public.irrigation_systems));
CREATE POLICY own_schedule_items_read ON public.irrigation_schedule_items FOR SELECT TO authenticated USING (irrigation_schedule_id IN (SELECT id FROM public.irrigation_schedules));
CREATE POLICY own_reasons_read ON public.recommendation_reasons FOR SELECT TO authenticated USING (recommendation_id IN (SELECT id FROM public.recommendations));
CREATE POLICY own_explanations_read ON public.prediction_explanations FOR SELECT TO authenticated USING (prediction_id IN (SELECT id FROM public.predictions));
CREATE POLICY own_constraints_read ON public.optimization_constraints FOR SELECT TO authenticated USING (optimization_run_id IN (SELECT id FROM public.optimization_runs));
CREATE POLICY own_notifications_read ON public.notifications FOR SELECT TO authenticated USING (user_id=(SELECT public.current_app_user_id()));
CREATE POLICY own_audit_read ON public.audit_logs FOR SELECT TO authenticated USING (actor_user_id=(SELECT public.current_app_user_id()));
GRANT SELECT ON public.crop_stage_observations,public.irrigation_zones,public.irrigation_schedule_items,public.recommendation_reasons,
 public.prediction_explanations,public.optimization_constraints,public.notifications,public.audit_logs TO authenticated;

-- Feedback validates both the submitting identity and the referenced holding.
CREATE POLICY own_feedback_read ON public.recommendation_feedback FOR SELECT TO authenticated
 USING (user_id=(SELECT public.current_app_user_id()) AND recommendation_id IN (SELECT id FROM public.recommendations));
CREATE POLICY own_feedback_insert ON public.recommendation_feedback FOR INSERT TO authenticated
 WITH CHECK (user_id=(SELECT public.current_app_user_id()) AND recommendation_id IN (SELECT id FROM public.recommendations));
CREATE POLICY own_farmer_feedback_read ON public.farmer_feedback FOR SELECT TO authenticated
 USING (user_id=(SELECT public.current_app_user_id()) AND (field_id IS NULL OR field_id IN (SELECT id FROM public.fields)));
CREATE POLICY own_farmer_feedback_insert ON public.farmer_feedback FOR INSERT TO authenticated
 WITH CHECK (user_id=(SELECT public.current_app_user_id()) AND (field_id IS NULL OR field_id IN (SELECT id FROM public.fields)));
GRANT SELECT,INSERT ON public.recommendation_feedback,public.farmer_feedback TO authenticated;

ALTER VIEW public.v_current_field_state SET (security_invoker=true);
ALTER VIEW public.v_latest_weather SET (security_invoker=true);
ALTER VIEW public.v_latest_satellite_indices SET (security_invoker=true);
ALTER VIEW public.v_active_irrigation_recommendations SET (security_invoker=true);
REVOKE ALL ON public.v_current_field_state,public.v_latest_weather,public.v_latest_satellite_indices,public.v_active_irrigation_recommendations FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.v_current_field_state,public.v_latest_weather,public.v_latest_satellite_indices,public.v_active_irrigation_recommendations TO authenticated,service_role;
-- Global scene metadata is read-only; no per-field processing payload is exposed.
GRANT SELECT ON public.satellite_scenes TO authenticated;
CREATE POLICY scene_catalog_read ON public.satellite_scenes FOR SELECT TO authenticated USING (true);

-- Derived/model labels cannot claim measured ground truth.
ALTER TABLE public.training_targets DROP CONSTRAINT chk_target_ground_truth;
ALTER TABLE public.training_targets ADD CONSTRAINT chk_target_ground_truth
 CHECK (NOT is_ground_truth OR target_type='OBSERVED');

-- Avoid wall-clock reinterpretation in non-UTC sessions.
CREATE OR REPLACE FUNCTION public.set_updated_at_column() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$ BEGIN NEW.updated_at:=now(); RETURN NEW; END $$;
DO $$ DECLARE c record; BEGIN
 FOR c IN SELECT table_name,column_name FROM information_schema.columns
 WHERE table_schema='public' AND data_type='timestamp with time zone'
 AND column_default LIKE '%timezone%' LOOP
  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT now()',c.table_name,c.column_name);
 END LOOP;
END $$;

-- Validate source geometry before casting to geography; derive values on every write.
CREATE OR REPLACE FUNCTION public.sync_field_spatial_attributes() RETURNS trigger
LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
 IF NEW.boundary IS NULL OR ST_IsEmpty(NEW.boundary) OR NOT ST_IsValid(NEW.boundary)
    OR NOT ST_CoveredBy(NEW.boundary,ST_MakeEnvelope(-180,-90,180,90,4326)) THEN
   RAISE EXCEPTION 'Field requires a nonempty valid WGS84 polygon' USING ERRCODE='23514';
 END IF;
 NEW.area_hectares:=public.calculate_field_geodesic_area_hectares(NEW.boundary);
 NEW.perimeter_meters:=round(ST_Perimeter(NEW.boundary::geography)::numeric,2);
 NEW.centroid:=ST_Centroid(NEW.boundary);
 IF EXISTS (SELECT FROM public.field_zones z WHERE z.field_id=NEW.id AND z.boundary IS NOT NULL AND NOT ST_CoveredBy(z.boundary,NEW.boundary)) THEN
   RAISE EXCEPTION 'Field boundary would exclude an existing zone' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER trg_fields_spatial_sync ON public.fields;
CREATE TRIGGER trg_fields_spatial_sync BEFORE INSERT OR UPDATE ON public.fields
 FOR EACH ROW EXECUTE FUNCTION public.sync_field_spatial_attributes();

CREATE FUNCTION public.validate_zone_geometry() RETURNS trigger
LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE parent_boundary geometry;
BEGIN
 SELECT boundary INTO parent_boundary FROM public.fields WHERE id=NEW.field_id FOR SHARE;
 IF parent_boundary IS NULL THEN RAISE EXCEPTION 'Zone field is unavailable' USING ERRCODE='23514'; END IF;
 IF NEW.boundary IS NOT NULL THEN
   IF ST_IsEmpty(NEW.boundary) OR NOT ST_IsValid(NEW.boundary) OR NOT ST_CoveredBy(NEW.boundary,parent_boundary) THEN
     RAISE EXCEPTION 'Zone must be a valid polygon contained within its field' USING ERRCODE='23514';
   END IF;
   NEW.area_hectares:=public.calculate_field_geodesic_area_hectares(NEW.boundary);
 ELSE
   NEW.area_hectares:=NULL;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_zones_spatial_sync BEFORE INSERT OR UPDATE ON public.field_zones
 FOR EACH ROW EXECUTE FUNCTION public.validate_zone_geometry();

-- Composite FKs enforce crop compatibility, including service-side writes.
ALTER TABLE public.crop_varieties ADD CONSTRAINT uq_variety_crop UNIQUE(id,crop_id);
ALTER TABLE public.crop_cycles ADD CONSTRAINT fk_cycle_variety_crop
 FOREIGN KEY(crop_variety_id,crop_id) REFERENCES public.crop_varieties(id,crop_id);
ALTER TABLE public.crop_parameters ADD CONSTRAINT fk_parameter_variety_crop
 FOREIGN KEY(crop_variety_id,crop_id) REFERENCES public.crop_varieties(id,crop_id);
ALTER TABLE public.crop_cycles ADD CONSTRAINT chk_actual_harvest_date CHECK(actual_harvest_date IS NULL OR actual_harvest_date>=sowing_date);

COMMIT;
