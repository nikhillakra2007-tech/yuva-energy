-- Migration: 009_irrigation.sql
-- Purpose: Water sources, delivery methods, physical irrigation systems, pump hydraulics, events, and water measurements.
-- Domain: Domain 7 — Water & Irrigation

-- Master Water Sources
CREATE TABLE IF NOT EXISTS public.water_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('BOREWELL', 'OPEN_WELL', 'CANAL', 'FARM_POND', 'RIVER', 'MUNICIPAL', 'RECYCLED')),
    salinity_status TEXT CHECK (salinity_status IN ('FRESH', 'SLIGHTLY_SALINE', 'MODERATELY_SALINE', 'HIGHLY_SALINE')),
    reliability_tier TEXT DEFAULT 'HIGH' CHECK (reliability_tier IN ('VERY_HIGH', 'HIGH', 'SEASONAL', 'INTERMITTENT', 'DEPLETED')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Master Irrigation Methods (FAO-defined efficiencies)
CREATE TABLE IF NOT EXISTS public.irrigation_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('MICRO_IRRIGATION', 'PRESSURIZED_OVERHEAD', 'SURFACE_GRAVITY', 'SUBSURFACE')),
    typical_application_efficiency_pct NUMERIC(4, 1) NOT NULL CHECK (typical_application_efficiency_pct >= 20 AND typical_application_efficiency_pct <= 98),
    wetting_fraction_fw NUMERIC(3, 2) NOT NULL CHECK (wetting_fraction_fw > 0 AND wetting_fraction_fw <= 1.0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- On-Farm Irrigation Systems
CREATE TABLE IF NOT EXISTS public.irrigation_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    field_id UUID REFERENCES public.fields(id) ON DELETE RESTRICT,
    irrigation_method_id UUID NOT NULL REFERENCES public.irrigation_methods(id) ON DELETE RESTRICT,
    water_source_id UUID NOT NULL REFERENCES public.water_sources(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    system_efficiency_pct NUMERIC(4, 1) CHECK (system_efficiency_pct >= 20 AND system_efficiency_pct <= 100),
    emitter_spacing_meters NUMERIC(4, 2),
    lateral_spacing_meters NUMERIC(4, 2),
    operating_pressure_bar NUMERIC(4, 2) CHECK (operating_pressure_bar IS NULL OR operating_pressure_bar > 0),
    automation_level TEXT NOT NULL DEFAULT 'MANUAL' CHECK (automation_level IN ('MANUAL', 'SEMI_AUTOMATED', 'FULLY_AUTOMATED_IOT')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Irrigation Zones
CREATE TABLE IF NOT EXISTS public.irrigation_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_zone_id UUID NOT NULL REFERENCES public.field_zones(id) ON DELETE RESTRICT,
    irrigation_system_id UUID NOT NULL REFERENCES public.irrigation_systems(id) ON DELETE RESTRICT,
    valve_identifier TEXT,
    design_flow_rate_l_min NUMERIC(8, 2) CHECK (design_flow_rate_l_min IS NULL OR design_flow_rate_l_min > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Pumps and Electric/Solar Motors
CREATE TABLE IF NOT EXISTS public.pumps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    irrigation_system_id UUID REFERENCES public.irrigation_systems(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    pump_type TEXT NOT NULL CHECK (pump_type IN ('SUBMERSIBLE', 'SURFACE_MONOBLOCK', 'OPENWELL_SUBMERSIBLE', 'SOLAR_DC_PUMP', 'CENTRIFUGAL', 'DIESEL_ENGINE')),
    rated_power_kw NUMERIC(6, 2) CHECK (rated_power_kw IS NULL OR rated_power_kw > 0),
    rated_power_hp NUMERIC(6, 2) CHECK (rated_power_hp IS NULL OR rated_power_hp > 0),
    rated_flow_rate_l_min NUMERIC(8, 2) CHECK (rated_flow_rate_l_min IS NULL OR rated_flow_rate_l_min > 0),
    rated_head_meters NUMERIC(6, 2) CHECK (rated_head_meters IS NULL OR rated_head_meters > 0),
    overall_efficiency_pct NUMERIC(4, 1) CHECK (overall_efficiency_pct IS NULL OR (overall_efficiency_pct >= 10 AND overall_efficiency_pct <= 95)),
    energy_source_code TEXT DEFAULT 'GRID_3_PHASE',
    installation_year INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Historical & Executed Irrigation Events
CREATE TABLE IF NOT EXISTS public.irrigation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    irrigation_system_id UUID NOT NULL REFERENCES public.irrigation_systems(id) ON DELETE RESTRICT,
    pump_id UUID REFERENCES public.pumps(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_minutes NUMERIC(7, 2) CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
    target_depth_mm NUMERIC(6, 2) CHECK (target_depth_mm IS NULL OR target_depth_mm >= 0),
    actual_depth_applied_mm NUMERIC(6, 2) CHECK (actual_depth_applied_mm IS NULL OR actual_depth_applied_mm >= 0),
    total_volume_litres NUMERIC(12, 2) CHECK (total_volume_litres IS NULL OR total_volume_litres >= 0),
    execution_status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (execution_status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_EXECUTED', 'CANCELLED')),
    provenance TEXT NOT NULL DEFAULT 'ESTIMATED' CHECK (provenance IN ('MEASURED', 'ESTIMATED', 'FARMER_REPORTED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Water Volume Measurements
CREATE TABLE IF NOT EXISTS public.water_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    irrigation_event_id UUID NOT NULL REFERENCES public.irrigation_events(id) ON DELETE RESTRICT,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    measurement_type TEXT NOT NULL CHECK (measurement_type IN ('PHYSICAL_FLOW_METER', 'PUMP_RUNTIME_FLOW_CALCULATION', 'CANAL_CREST_GAUGE', 'RESERVOIR_DROP_INFERRED')),
    volume_cubic_meters NUMERIC(10, 3) NOT NULL CHECK (volume_cubic_meters >= 0),
    volume_litres NUMERIC(12, 2) NOT NULL CHECK (volume_litres >= 0),
    measured_flow_rate_l_min NUMERIC(8, 2),
    provenance TEXT NOT NULL CHECK (provenance IN ('MEASURED', 'ESTIMATED', 'CALCULATED')),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
