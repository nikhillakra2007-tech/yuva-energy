-- Migration: 011_agricultural_intelligence.sql
-- Purpose: Unified farm state synthesis, FAO-56 Penman-Monteith ET, soil water balance, and stress estimates.
-- Domain: Domain 9 — Agricultural Intelligence

-- Consolidated Point-in-Time Field / Farm State
CREATE TABLE IF NOT EXISTS public.farm_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    growth_stage_id UUID REFERENCES public.crop_growth_stages(id) ON DELETE SET NULL,
    evaluated_at TIMESTAMPTZ NOT NULL,
    current_canopy_cover_pct NUMERIC(5, 2) CHECK (current_canopy_cover_pct IS NULL OR (current_canopy_cover_pct >= 0 AND current_canopy_cover_pct <= 100)),
    current_ndvi NUMERIC(5, 4) CHECK (current_ndvi IS NULL OR (current_ndvi >= -1.0 AND current_ndvi <= 1.0)),
    current_soil_moisture_vwc NUMERIC(4, 3) CHECK (current_soil_moisture_vwc IS NULL OR (current_soil_moisture_vwc >= 0 AND current_soil_moisture_vwc <= 1.0)),
    current_root_zone_depletion_mm NUMERIC(6, 2) CHECK (current_root_zone_depletion_mm IS NULL OR current_root_zone_depletion_mm >= 0),
    daily_etc_mm NUMERIC(6, 2) CHECK (daily_etc_mm IS NULL OR daily_etc_mm >= 0),
    water_stress_index_cwsi NUMERIC(4, 3) CHECK (water_stress_index_cwsi IS NULL OR (water_stress_index_cwsi >= 0 AND water_stress_index_cwsi <= 1.0)),
    data_completeness_score NUMERIC(4, 3) NOT NULL CHECK (data_completeness_score >= 0 AND data_completeness_score <= 1.0),
    overall_confidence_score NUMERIC(4, 3) NOT NULL CHECK (overall_confidence_score >= 0 AND overall_confidence_score <= 1.0),
    state_summary_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- FAO-56 Reference and Crop Evapotranspiration Calculations
CREATE TABLE IF NOT EXISTS public.evapotranspiration_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    calculation_date DATE NOT NULL,
    calculation_method TEXT NOT NULL DEFAULT 'FAO56_PENMAN_MONTEITH' CHECK (calculation_method IN ('FAO56_PENMAN_MONTEITH', 'HARGREAVES_SAMANI', 'PRIESTLEY_TAYLOR')),
    reference_et0_mm NUMERIC(6, 2) NOT NULL CHECK (reference_et0_mm >= 0),
    crop_coefficient_kc NUMERIC(4, 2) NOT NULL CHECK (crop_coefficient_kc >= 0.1 AND crop_coefficient_kc <= 2.5),
    potential_etc_mm NUMERIC(6, 2) NOT NULL CHECK (potential_etc_mm >= 0),
    stress_reduction_factor_ks NUMERIC(4, 3) NOT NULL DEFAULT 1.0 CHECK (stress_reduction_factor_ks >= 0 AND stress_reduction_factor_ks <= 1.0),
    adjusted_etc_mm NUMERIC(6, 2) NOT NULL CHECK (adjusted_etc_mm >= 0),
    input_meteorological_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_field_et_date UNIQUE (field_id, calculation_date)
);

-- Daily Root-Zone Soil Water Balance Accounting (FAO-56 Chapter 8)
CREATE TABLE IF NOT EXISTS public.soil_water_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    balance_date DATE NOT NULL,
    initial_depletion_mm NUMERIC(6, 2) NOT NULL CHECK (initial_depletion_mm >= 0),
    precipitation_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (precipitation_mm >= 0),
    effective_precipitation_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (effective_precipitation_mm >= 0),
    irrigation_applied_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (irrigation_applied_mm >= 0),
    actual_etc_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (actual_etc_mm >= 0),
    deep_percolation_loss_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (deep_percolation_loss_mm >= 0),
    surface_runoff_loss_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (surface_runoff_loss_mm >= 0),
    final_depletion_mm NUMERIC(6, 2) NOT NULL CHECK (final_depletion_mm >= 0),
    total_available_water_taw_mm NUMERIC(6, 2) NOT NULL CHECK (total_available_water_taw_mm > 0),
    readily_available_water_raw_mm NUMERIC(6, 2) NOT NULL CHECK (readily_available_water_raw_mm > 0),
    is_water_stressed BOOLEAN NOT NULL DEFAULT false,
    provenance TEXT NOT NULL DEFAULT 'CALCULATED',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_field_balance_date UNIQUE (field_id, balance_date)
);

-- Scientific Baseline Water Requirement Calculations (Prior to ML optimization)
CREATE TABLE IF NOT EXISTS public.water_requirement_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    calculation_date DATE NOT NULL,
    net_irrigation_requirement_mm NUMERIC(6, 2) NOT NULL CHECK (net_irrigation_requirement_mm >= 0),
    application_efficiency_pct NUMERIC(4, 1) NOT NULL CHECK (application_efficiency_pct >= 20 AND application_efficiency_pct <= 100),
    gross_irrigation_requirement_mm NUMERIC(6, 2) NOT NULL CHECK (gross_irrigation_requirement_mm >= 0),
    gross_volume_litres NUMERIC(14, 2) NOT NULL CHECK (gross_volume_litres >= 0),
    gross_volume_m3 NUMERIC(10, 3) NOT NULL CHECK (gross_volume_m3 >= 0),
    leaching_requirement_mm NUMERIC(5, 2) DEFAULT 0 CHECK (leaching_requirement_mm >= 0),
    calculation_method TEXT NOT NULL DEFAULT 'FAO56_DAILY_DEPLETION',
    provenance TEXT NOT NULL DEFAULT 'CALCULATED',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Crop Water Stress Estimates
CREATE TABLE IF NOT EXISTS public.water_stress_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    estimated_at TIMESTAMPTZ NOT NULL,
    stress_index_value NUMERIC(4, 3) NOT NULL CHECK (stress_index_value >= 0 AND stress_index_value <= 1.0),
    stress_category TEXT NOT NULL CHECK (stress_category IN ('NONE', 'MILD', 'MODERATE', 'SEVERE', 'CRITICAL')),
    methodology TEXT NOT NULL DEFAULT 'ROOT_ZONE_DEPLETION_RATIO' CHECK (methodology IN ('ROOT_ZONE_DEPLETION_RATIO', 'CWSI_CANOPY_TEMPERATURE', 'NDVI_HISTORICAL_ANOMALY', 'MULTI_SIGNAL_FUSION')),
    provenance TEXT NOT NULL DEFAULT 'ESTIMATED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
