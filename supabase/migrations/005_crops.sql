-- Migration: 005_crops.sql
-- Purpose: Crop taxonomy, varieties, seasonal cycles, growth stages, FAO-56 parameters, and regional stats.
-- Domain: Domain 3 — Crop & Agronomy

-- Master Crop Catalog
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    botanical_name TEXT,
    crop_category TEXT NOT NULL CHECK (crop_category IN ('CEREAL', 'PULSE', 'OILSEED', 'VEGETABLE', 'FRUIT', 'CASH_CROP', 'FODDER', 'OTHER')),
    default_season TEXT CHECK (default_season IN ('KHARIF', 'RABI', 'ZAID', 'PERENNIAL', 'ALL_SEASON')),
    water_demand_category TEXT CHECK (water_demand_category IN ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')),
    typical_duration_days INTEGER CHECK (typical_duration_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Crop Varieties (1 Crop -> N Varieties)
CREATE TABLE IF NOT EXISTS public.crop_varieties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    breeder_agency TEXT,
    maturity_duration_days INTEGER CHECK (maturity_duration_days > 0),
    drought_tolerance TEXT CHECK (drought_tolerance IN ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH')),
    potential_yield_kg_per_ha NUMERIC(10, 2) CHECK (potential_yield_kg_per_ha IS NULL OR potential_yield_kg_per_ha > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_crop_variety_code UNIQUE (crop_id, code)
);

-- Field Crop Cycles (1 Field -> Multiple Historical Planting Cycles)
CREATE TABLE IF NOT EXISTS public.crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    crop_variety_id UUID REFERENCES public.crop_varieties(id) ON DELETE RESTRICT,
    season TEXT NOT NULL CHECK (season IN ('KHARIF', 'RABI', 'ZAID', 'ANNUAL', 'SPRING', 'AUTUMN', 'SUMMER', 'WINTER')),
    cycle_year INTEGER NOT NULL CHECK (cycle_year >= 1990 AND cycle_year <= 2100),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    planted_area_hectares NUMERIC(10, 4) CHECK (planted_area_hectares IS NULL OR planted_area_hectares > 0),
    target_yield_kg_per_ha NUMERIC(10, 2),
    actual_yield_kg_per_ha NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNED', 'ACTIVE', 'HARVESTED', 'FAILED', 'TERMINATED')),
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_crop_cycle_dates CHECK (expected_harvest_date IS NULL OR expected_harvest_date >= sowing_date)
);

-- Master Crop Growth Stages
CREATE TABLE IF NOT EXISTS public.crop_growth_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    stage_code TEXT NOT NULL CHECK (stage_code IN ('INITIAL', 'DEVELOPMENT', 'MID_SEASON', 'LATE_SEASON', 'HARVEST')),
    stage_name TEXT NOT NULL,
    stage_order INTEGER NOT NULL CHECK (stage_order >= 1 AND stage_order <= 10),
    typical_duration_days INTEGER CHECK (typical_duration_days > 0),
    kc_coefficient NUMERIC(4, 2) CHECK (kc_coefficient >= 0.1 AND kc_coefficient <= 2.5),
    rooting_depth_meters NUMERIC(4, 2) CHECK (rooting_depth_meters > 0 AND rooting_depth_meters <= 5.0),
    depletion_fraction_p NUMERIC(3, 2) CHECK (depletion_fraction_p > 0 AND depletion_fraction_p <= 1.0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_crop_growth_stage UNIQUE (crop_id, stage_code)
);

-- Crop Stage Observations per Cycle
CREATE TABLE IF NOT EXISTS public.crop_stage_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL REFERENCES public.crop_cycles(id) ON DELETE RESTRICT,
    growth_stage_id UUID NOT NULL REFERENCES public.crop_growth_stages(id) ON DELETE RESTRICT,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    provenance TEXT NOT NULL CHECK (provenance IN ('EXPECTED', 'FARMER_CONFIRMED', 'MODEL_INFERRED', 'REMOTE_SENSING_INFERRED')),
    confidence_score NUMERIC(4, 3) CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1.0)),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Crop Model Parameters (FAO-56 Baseline)
CREATE TABLE IF NOT EXISTS public.crop_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    crop_variety_id UUID REFERENCES public.crop_varieties(id) ON DELETE RESTRICT,
    version_tag TEXT NOT NULL DEFAULT 'FAO-56-DEFAULT',
    kc_initial NUMERIC(4, 2) NOT NULL CHECK (kc_initial > 0),
    kc_mid NUMERIC(4, 2) NOT NULL CHECK (kc_mid > 0),
    kc_end NUMERIC(4, 2) NOT NULL CHECK (kc_end > 0),
    min_root_depth_meters NUMERIC(4, 2) NOT NULL CHECK (min_root_depth_meters > 0),
    max_root_depth_meters NUMERIC(4, 2) NOT NULL CHECK (max_root_depth_meters >= min_root_depth_meters),
    critical_depletion_fraction_p NUMERIC(3, 2) NOT NULL CHECK (critical_depletion_fraction_p > 0 AND critical_depletion_fraction_p <= 1.0),
    yield_response_factor_ky NUMERIC(4, 2) CHECK (yield_response_factor_ky >= 0),
    max_height_meters NUMERIC(4, 2) CHECK (max_height_meters > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Regional Historical Statistics
CREATE TABLE IF NOT EXISTS public.crop_production_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    administrative_area_id UUID REFERENCES public.administrative_areas(id) ON DELETE SET NULL,
    region_name TEXT NOT NULL,
    statistic_year INTEGER NOT NULL CHECK (statistic_year >= 1950 AND statistic_year <= 2100),
    season TEXT NOT NULL,
    area_sown_hectares NUMERIC(14, 2) CHECK (area_sown_hectares IS NULL OR area_sown_hectares >= 0),
    production_metric_tonnes NUMERIC(14, 2) CHECK (production_metric_tonnes IS NULL OR production_metric_tonnes >= 0),
    average_yield_kg_per_ha NUMERIC(10, 2) CHECK (average_yield_kg_per_ha IS NULL OR average_yield_kg_per_ha >= 0),
    source_agency TEXT NOT NULL DEFAULT 'GOVERNMENT_STATISTICS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
