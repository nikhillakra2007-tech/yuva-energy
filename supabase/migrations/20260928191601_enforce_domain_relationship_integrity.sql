-- Audited relational inconsistencies, enforced for both clients and trusted workers.
-- No telemetry is created and no existing mismatched rows are silently rewritten.
BEGIN;

ALTER TABLE public.fields ADD CONSTRAINT uq_field_farm UNIQUE(id,farm_id);
ALTER TABLE public.irrigation_systems ADD CONSTRAINT uq_irrigation_system_farm UNIQUE(id,farm_id);
ALTER TABLE public.irrigation_systems ADD CONSTRAINT fk_irrigation_field_farm
 FOREIGN KEY(field_id,farm_id) REFERENCES public.fields(id,farm_id);
ALTER TABLE public.pumps ADD CONSTRAINT fk_pump_system_farm
 FOREIGN KEY(irrigation_system_id,farm_id) REFERENCES public.irrigation_systems(id,farm_id);
ALTER TABLE public.pumps ADD CONSTRAINT uq_pump_farm UNIQUE(id,farm_id);

-- Stage observations carry their cycle's crop identity, enforced by both parent FKs.
ALTER TABLE public.crop_cycles ADD CONSTRAINT uq_cycle_crop UNIQUE(id,crop_id);
ALTER TABLE public.crop_cycles ADD CONSTRAINT uq_cycle_field UNIQUE(id,field_id);
ALTER TABLE public.crop_growth_stages ADD CONSTRAINT uq_stage_crop UNIQUE(id,crop_id);
ALTER TABLE public.crop_stage_observations ADD COLUMN crop_id uuid;
UPDATE public.crop_stage_observations o SET crop_id=c.crop_id FROM public.crop_cycles c WHERE c.id=o.crop_cycle_id;
ALTER TABLE public.crop_stage_observations ALTER COLUMN crop_id SET NOT NULL;
ALTER TABLE public.crop_stage_observations ADD CONSTRAINT fk_observation_cycle_crop
 FOREIGN KEY(crop_cycle_id,crop_id) REFERENCES public.crop_cycles(id,crop_id);
ALTER TABLE public.crop_stage_observations ADD CONSTRAINT fk_observation_stage_crop
 FOREIGN KEY(growth_stage_id,crop_id) REFERENCES public.crop_growth_stages(id,crop_id);
CREATE FUNCTION public.sync_observation_crop() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 SELECT crop_id INTO NEW.crop_id FROM public.crop_cycles WHERE id=NEW.crop_cycle_id;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_observation_crop BEFORE INSERT OR UPDATE ON public.crop_stage_observations
 FOR EACH ROW EXECUTE FUNCTION public.sync_observation_crop();

-- A cycle-derived value cannot name an unrelated field.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['farm_states','evapotranspiration_calculations','soil_water_balance',
 'water_requirement_calculations','water_stress_estimates','feature_snapshots'] LOOP
  EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY(crop_cycle_id,field_id) REFERENCES public.crop_cycles(id,field_id)',t,'fk_'||t||'_cycle_field');
 END LOOP;
END $$;
ALTER TABLE public.feature_snapshots ADD CONSTRAINT uq_snapshot_field UNIQUE(id,field_id);
ALTER TABLE public.predictions ADD CONSTRAINT fk_prediction_snapshot_field
 FOREIGN KEY(feature_snapshot_id,field_id) REFERENCES public.feature_snapshots(id,field_id);
ALTER TABLE public.predictions ADD CONSTRAINT uq_prediction_field UNIQUE(id,field_id);
ALTER TABLE public.optimization_runs ADD CONSTRAINT fk_optimization_prediction_field
 FOREIGN KEY(prediction_id,field_id) REFERENCES public.predictions(id,field_id);
ALTER TABLE public.optimization_runs ADD CONSTRAINT uq_optimization_field UNIQUE(id,field_id);
ALTER TABLE public.irrigation_schedules ADD CONSTRAINT fk_schedule_optimization_field
 FOREIGN KEY(optimization_run_id,field_id) REFERENCES public.optimization_runs(id,field_id);
ALTER TABLE public.irrigation_schedules ADD CONSTRAINT uq_schedule_field UNIQUE(id,field_id);
ALTER TABLE public.irrigation_schedules ADD CONSTRAINT uq_schedule_run_field UNIQUE(id,optimization_run_id,field_id);
ALTER TABLE public.recommendations ADD CONSTRAINT fk_recommendation_schedule_field
 FOREIGN KEY(irrigation_schedule_id,field_id) REFERENCES public.irrigation_schedules(id,field_id);
ALTER TABLE public.recommendations ADD CONSTRAINT fk_recommendation_optimization_field
 FOREIGN KEY(optimization_run_id,field_id) REFERENCES public.optimization_runs(id,field_id);
ALTER TABLE public.recommendations ADD CONSTRAINT fk_recommendation_schedule_run
 FOREIGN KEY(irrigation_schedule_id,optimization_run_id,field_id) REFERENCES public.irrigation_schedules(id,optimization_run_id,field_id);

ALTER TABLE public.satellite_observations ADD CONSTRAINT uq_satellite_observation_field UNIQUE(id,field_id);
ALTER TABLE public.vegetation_indices ADD CONSTRAINT fk_vegetation_observation_field
 FOREIGN KEY(satellite_observation_id,field_id) REFERENCES public.satellite_observations(id,field_id);

-- Schedule items derive identity from their schedule, then constrain zone/pump parents.
ALTER TABLE public.field_zones ADD CONSTRAINT uq_zone_field UNIQUE(id,field_id);
ALTER TABLE public.irrigation_schedule_items ADD COLUMN field_id uuid;
ALTER TABLE public.irrigation_schedule_items ADD COLUMN farm_id uuid;
UPDATE public.irrigation_schedule_items i SET field_id=s.field_id,farm_id=f.farm_id
 FROM public.irrigation_schedules s JOIN public.fields f ON f.id=s.field_id WHERE s.id=i.irrigation_schedule_id;
ALTER TABLE public.irrigation_schedule_items ALTER COLUMN field_id SET NOT NULL;
ALTER TABLE public.irrigation_schedule_items ALTER COLUMN farm_id SET NOT NULL;
ALTER TABLE public.irrigation_schedule_items ADD CONSTRAINT fk_item_schedule_field
 FOREIGN KEY(irrigation_schedule_id,field_id) REFERENCES public.irrigation_schedules(id,field_id);
ALTER TABLE public.irrigation_schedule_items ADD CONSTRAINT fk_item_field_farm
 FOREIGN KEY(field_id,farm_id) REFERENCES public.fields(id,farm_id);
ALTER TABLE public.irrigation_schedule_items ADD CONSTRAINT fk_item_zone_field
 FOREIGN KEY(field_zone_id,field_id) REFERENCES public.field_zones(id,field_id);
ALTER TABLE public.irrigation_schedule_items ADD CONSTRAINT fk_item_pump_farm
 FOREIGN KEY(pump_id,farm_id) REFERENCES public.pumps(id,farm_id);
CREATE FUNCTION public.sync_schedule_item_identity() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 SELECT s.field_id,f.farm_id INTO NEW.field_id,NEW.farm_id
 FROM public.irrigation_schedules s JOIN public.fields f ON f.id=s.field_id WHERE s.id=NEW.irrigation_schedule_id;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_schedule_item_identity BEFORE INSERT OR UPDATE ON public.irrigation_schedule_items
 FOR EACH ROW EXECUTE FUNCTION public.sync_schedule_item_identity();

-- Ground-truth labels need an actual observation and one, unambiguous target value.
ALTER TABLE public.training_targets ADD CONSTRAINT chk_target_value_exclusive
 CHECK ((target_value_numeric IS NOT NULL)::integer + (target_value_class IS NOT NULL)::integer=1);
ALTER TABLE public.training_targets ADD CONSTRAINT uq_training_target UNIQUE(training_example_id,target_code);
ALTER TABLE public.training_examples ADD CONSTRAINT uq_dataset_snapshot UNIQUE(training_dataset_id,feature_snapshot_id);

COMMIT;
