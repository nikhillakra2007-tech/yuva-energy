-- Migration: 20260929210000_enforce_cross_asset_and_event_integrity.sql
-- Purpose: Enforce cross-asset, energy, satellite, and executed irrigation event domain integrity.
-- Audited relational consistency: prevents cross-farm assets, mismatching execution parents, and unphysical scientific inputs.

BEGIN;

-- 1. Irrigation events cross-parent and farm integrity
ALTER TABLE public.irrigation_events ADD COLUMN IF NOT EXISTS farm_id uuid;
UPDATE public.irrigation_events e SET farm_id = f.farm_id FROM public.fields f WHERE f.id = e.field_id;
ALTER TABLE public.irrigation_events ALTER COLUMN farm_id SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_irrigation_event_farm() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
    SELECT farm_id INTO NEW.farm_id FROM public.fields WHERE id = NEW.field_id;
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_irrigation_event_farm ON public.irrigation_events;
CREATE TRIGGER trg_irrigation_event_farm BEFORE INSERT OR UPDATE ON public.irrigation_events
    FOR EACH ROW EXECUTE FUNCTION public.sync_irrigation_event_farm();

ALTER TABLE public.irrigation_events ADD CONSTRAINT fk_event_field_farm
    FOREIGN KEY(field_id, farm_id) REFERENCES public.fields(id, farm_id);

ALTER TABLE public.irrigation_events ADD CONSTRAINT fk_event_system_farm
    FOREIGN KEY(irrigation_system_id, farm_id) REFERENCES public.irrigation_systems(id, farm_id);

ALTER TABLE public.irrigation_events ADD CONSTRAINT fk_event_pump_farm
    FOREIGN KEY(pump_id, farm_id) REFERENCES public.pumps(id, farm_id);

ALTER TABLE public.irrigation_events ADD CONSTRAINT uq_irrigation_event_field UNIQUE(id, field_id);

-- 2. Water measurements must match irrigation event field
ALTER TABLE public.water_measurements ADD CONSTRAINT fk_water_measurement_event_field
    FOREIGN KEY(irrigation_event_id, field_id) REFERENCES public.irrigation_events(id, field_id);

-- 3. Energy systems & assets cross-farm and pump integrity
ALTER TABLE public.energy_systems ADD CONSTRAINT uq_energy_system_farm UNIQUE(id, farm_id);

ALTER TABLE public.energy_assets ADD COLUMN IF NOT EXISTS farm_id uuid;
UPDATE public.energy_assets a SET farm_id = s.farm_id FROM public.energy_systems s WHERE s.id = a.energy_system_id;
ALTER TABLE public.energy_assets ALTER COLUMN farm_id SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_energy_asset_farm() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
    SELECT farm_id INTO NEW.farm_id FROM public.energy_systems WHERE id = NEW.energy_system_id;
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_energy_asset_farm ON public.energy_assets;
CREATE TRIGGER trg_energy_asset_farm BEFORE INSERT OR UPDATE ON public.energy_assets
    FOR EACH ROW EXECUTE FUNCTION public.sync_energy_asset_farm();

ALTER TABLE public.energy_assets ADD CONSTRAINT fk_energy_asset_system_farm
    FOREIGN KEY(energy_system_id, farm_id) REFERENCES public.energy_systems(id, farm_id);

ALTER TABLE public.energy_assets ADD CONSTRAINT fk_energy_asset_pump_farm
    FOREIGN KEY(pump_id, farm_id) REFERENCES public.pumps(id, farm_id);

ALTER TABLE public.energy_assets ADD CONSTRAINT uq_energy_asset_system UNIQUE(id, energy_system_id);

-- 4. Energy observations asset must belong to energy system
ALTER TABLE public.energy_observations ADD CONSTRAINT fk_energy_observation_asset_system
    FOREIGN KEY(asset_id, energy_system_id) REFERENCES public.energy_assets(id, energy_system_id);

-- 5. Satellite assets must match observation field
ALTER TABLE public.satellite_assets ADD CONSTRAINT fk_satellite_asset_obs_field
    FOREIGN KEY(satellite_observation_id, field_id) REFERENCES public.satellite_observations(id, field_id);

-- 6. Scientific helper input validation hardening
CREATE OR REPLACE FUNCTION public.estimate_hargreaves_et0(
    t_mean_celsius NUMERIC,
    t_min_celsius NUMERIC,
    t_max_celsius NUMERIC,
    extraterrestrial_radiation_ra_mm NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
    temp_diff NUMERIC;
    calculated_et0 NUMERIC;
BEGIN
    IF t_mean_celsius IS NULL OR t_min_celsius IS NULL OR t_max_celsius IS NULL OR extraterrestrial_radiation_ra_mm IS NULL THEN
        RETURN NULL;
    END IF;

    -- Physical validity constraints
    IF t_max_celsius < t_min_celsius OR extraterrestrial_radiation_ra_mm < 0 OR t_mean_celsius < -60 OR t_max_celsius > 70 THEN
        RETURN NULL;
    END IF;

    temp_diff := t_max_celsius - t_min_celsius;
    IF temp_diff <= 0 THEN
        RETURN 0.0;
    END IF;

    calculated_et0 := 0.0023 * (t_mean_celsius + 17.8) * SQRT(temp_diff) * extraterrestrial_radiation_ra_mm;
    RETURN ROUND(GREATEST(0.0, calculated_et0)::numeric, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMIT;
