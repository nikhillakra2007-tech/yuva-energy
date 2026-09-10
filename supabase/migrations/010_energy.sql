-- Migration: 010_energy.sql
-- Purpose: Energy sources, systems, electrical/solar assets, time-series telemetry, TOU tariffs, and solar forecasts.
-- Domain: Domain 8 — Energy & Power

-- Master Energy Sources
CREATE TABLE IF NOT EXISTS public.energy_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    source_category TEXT NOT NULL CHECK (source_category IN ('GRID_UTILITY', 'SOLAR_PHOTOVOLTAIC', 'BATTERY_STORAGE', 'DIESEL_GENERATOR', 'WIND', 'HYBRID')),
    emission_factor_kg_co2_per_kwh NUMERIC(6, 4) CHECK (emission_factor_kg_co2_per_kwh >= 0),
    is_renewable BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Farm Energy Infrastructure Systems
CREATE TABLE IF NOT EXISTS public.energy_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    primary_source_id UUID NOT NULL REFERENCES public.energy_sources(id) ON DELETE RESTRICT,
    grid_sanctioned_load_kw NUMERIC(6, 2) CHECK (grid_sanctioned_load_kw IS NULL OR grid_sanctioned_load_kw >= 0),
    solar_capacity_kwp NUMERIC(6, 2) CHECK (solar_capacity_kwp IS NULL OR solar_capacity_kwp >= 0),
    battery_capacity_kwh NUMERIC(7, 2) CHECK (battery_capacity_kwh IS NULL OR battery_capacity_kwh >= 0),
    has_net_metering BOOLEAN NOT NULL DEFAULT false,
    feeder_schedule_type TEXT DEFAULT 'ROSTERED_AGRICULTURAL' CHECK (feeder_schedule_type IN ('CONTINUOUS_24X7', 'ROSTERED_AGRICULTURAL', 'SOLAR_HOURS_ONLY', 'NIGHT_HOURS_ONLY')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Energy Assets (Inverters, Panels, Drives, Meters)
CREATE TABLE IF NOT EXISTS public.energy_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    energy_system_id UUID NOT NULL REFERENCES public.energy_systems(id) ON DELETE RESTRICT,
    pump_id UUID REFERENCES public.pumps(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('SOLAR_PV_ARRAY', 'SOLAR_PUMP_INVERTER', 'GRID_INTERACTIVE_INVERTER', 'VARIABLE_FREQUENCY_DRIVE', 'LITHIUM_BATTERY_BANK', 'SMART_BIDIRECTIONAL_METER', 'DIESEL_GENSET')),
    manufacturer TEXT,
    model_number TEXT,
    rated_capacity_kw NUMERIC(7, 2) CHECK (rated_capacity_kw IS NULL OR rated_capacity_kw > 0),
    efficiency_percentage NUMERIC(4, 1) CHECK (efficiency_percentage IS NULL OR (efficiency_percentage >= 50 AND efficiency_percentage <= 99.9)),
    installation_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Time-Series Electrical & Solar Measurements
CREATE TABLE IF NOT EXISTS public.energy_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    energy_system_id UUID NOT NULL REFERENCES public.energy_systems(id) ON DELETE RESTRICT,
    asset_id UUID REFERENCES public.energy_assets(id) ON DELETE SET NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    active_power_kw NUMERIC(8, 3) CHECK (active_power_kw IS NULL OR active_power_kw >= 0),
    energy_consumed_kwh NUMERIC(10, 3) CHECK (energy_consumed_kwh IS NULL OR energy_consumed_kwh >= 0),
    energy_generated_solar_kwh NUMERIC(10, 3) CHECK (energy_generated_solar_kwh IS NULL OR energy_generated_solar_kwh >= 0),
    line_voltage_volts NUMERIC(6, 2) CHECK (line_voltage_volts IS NULL OR line_voltage_volts >= 0),
    current_amperes NUMERIC(6, 2) CHECK (current_amperes IS NULL OR current_amperes >= 0),
    power_factor NUMERIC(3, 2) CHECK (power_factor IS NULL OR (power_factor >= -1.0 AND power_factor <= 1.0)),
    frequency_hertz NUMERIC(4, 2) CHECK (frequency_hertz IS NULL OR (frequency_hertz >= 40.0 AND frequency_hertz <= 70.0)),
    provenance TEXT NOT NULL DEFAULT 'MEASURED' CHECK (provenance IN ('MEASURED', 'INVERTER_LOGGED', 'CALCULATED', 'ESTIMATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Electricity Pricing Tariffs (TOU / TOD / Subsidized)
CREATE TABLE IF NOT EXISTS public.energy_tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    energy_system_id UUID REFERENCES public.energy_systems(id) ON DELETE CASCADE,
    utility_provider_name TEXT NOT NULL,
    tariff_code TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    effective_from DATE NOT NULL,
    effective_to DATE,
    rate_standard_per_kwh NUMERIC(7, 3) NOT NULL CHECK (rate_standard_per_kwh >= 0),
    rate_peak_per_kwh NUMERIC(7, 3) NOT NULL CHECK (rate_peak_per_kwh >= 0),
    rate_off_peak_per_kwh NUMERIC(7, 3) NOT NULL CHECK (rate_off_peak_per_kwh >= 0),
    peak_window_start TIME NOT NULL DEFAULT '18:00:00',
    peak_window_end TIME NOT NULL DEFAULT '22:00:00',
    off_peak_window_start TIME NOT NULL DEFAULT '22:00:00',
    off_peak_window_end TIME NOT NULL DEFAULT '06:00:00',
    solar_feed_in_tariff_per_kwh NUMERIC(7, 3) DEFAULT 0 CHECK (solar_feed_in_tariff_per_kwh >= 0),
    is_agricultural_subsidized BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Day-Ahead Solar Generation & Energy Availability Forecasts
CREATE TABLE IF NOT EXISTS public.energy_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    energy_system_id UUID NOT NULL REFERENCES public.energy_systems(id) ON DELETE RESTRICT,
    forecast_generated_at TIMESTAMPTZ NOT NULL,
    forecast_target_at TIMESTAMPTZ NOT NULL,
    predicted_solar_generation_kw NUMERIC(7, 2) CHECK (predicted_solar_generation_kw IS NULL OR predicted_solar_generation_kw >= 0),
    expected_solar_energy_kwh NUMERIC(7, 2) CHECK (expected_solar_energy_kwh IS NULL OR expected_solar_energy_kwh >= 0),
    grid_availability_probability_pct NUMERIC(5, 2) CHECK (grid_availability_probability_pct >= 0 AND grid_availability_probability_pct <= 100),
    is_peak_tariff_window BOOLEAN NOT NULL DEFAULT false,
    forecast_model_name TEXT NOT NULL DEFAULT 'PV_CLEAR_SKY_SOLIS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_energy_forecast_target UNIQUE (energy_system_id, forecast_target_at)
);
