-- Migration: 013_optimization.sql
-- Purpose: Water and energy multi-objective optimization runs, operational constraints, and multi-zone irrigation schedules.
-- Domain: Domain 11 — Optimization & Scheduling

-- Multi-Objective Optimization Executions
CREATE TABLE IF NOT EXISTS public.optimization_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE SET NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    optimization_horizon_hours INTEGER NOT NULL DEFAULT 48 CHECK (optimization_horizon_hours > 0),
    primary_objective TEXT NOT NULL CHECK (primary_objective IN ('SOLAR_SELF_CONSUMPTION_MAX', 'GRID_COST_MIN', 'WATER_CONSERVATION', 'BALANCED_PARETO')),
    solver_name TEXT NOT NULL DEFAULT 'SCIPY_MIP_OPTIMIZER',
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('RUNNING', 'COMPLETED', 'INFEASIBLE', 'FAILED')),
    objective_score NUMERIC(10, 4),
    input_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Operational & Hydraulic Constraints
CREATE TABLE IF NOT EXISTS public.optimization_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimization_run_id UUID NOT NULL REFERENCES public.optimization_runs(id) ON DELETE CASCADE,
    constraint_type TEXT NOT NULL CHECK (constraint_type IN ('MAX_PUMP_RUNTIME_HOURS', 'PUMP_HYDRAULIC_CAPACITY', 'AVOID_PEAK_GRID_TARIFF', 'SOLAR_WINDOW_ALIGNMENT', 'RAIN_FORECAST_HOLD', 'SOIL_INFILTRATION_LIMIT')),
    is_hard_constraint BOOLEAN NOT NULL DEFAULT true,
    constraint_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_satisfied BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Optimized Master Irrigation Schedules
CREATE TABLE IF NOT EXISTS public.irrigation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimization_run_id UUID NOT NULL REFERENCES public.optimization_runs(id) ON DELETE RESTRICT,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    total_water_volume_litres NUMERIC(14, 2) NOT NULL CHECK (total_water_volume_litres >= 0),
    total_water_depth_mm NUMERIC(6, 2) NOT NULL CHECK (total_water_depth_mm >= 0),
    estimated_energy_kwh NUMERIC(8, 2) NOT NULL CHECK (estimated_energy_kwh >= 0),
    estimated_solar_energy_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (estimated_solar_energy_kwh >= 0),
    estimated_grid_cost_inr NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (estimated_grid_cost_inr >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUPERSEDED', 'CANCELLED', 'EXECUTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_schedule_window CHECK (valid_to > valid_from)
);

-- Discrete Operational Items within Schedules (VFD/Pump/Zone windows)
CREATE TABLE IF NOT EXISTS public.irrigation_schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    irrigation_schedule_id UUID NOT NULL REFERENCES public.irrigation_schedules(id) ON DELETE CASCADE,
    field_zone_id UUID REFERENCES public.field_zones(id) ON DELETE SET NULL,
    pump_id UUID REFERENCES public.pumps(id) ON DELETE SET NULL,
    planned_start_time TIMESTAMPTZ NOT NULL,
    planned_end_time TIMESTAMPTZ NOT NULL,
    planned_duration_minutes NUMERIC(6, 1) NOT NULL CHECK (planned_duration_minutes > 0),
    target_depth_mm NUMERIC(5, 2) NOT NULL CHECK (target_depth_mm >= 0),
    target_volume_litres NUMERIC(12, 2) NOT NULL CHECK (target_volume_litres >= 0),
    planned_energy_source TEXT NOT NULL CHECK (planned_energy_source IN ('SOLAR_PV', 'OFF_PEAK_GRID', 'STANDARD_GRID', 'BATTERY', 'HYBRID')),
    estimated_pump_load_kw NUMERIC(6, 2) CHECK (estimated_pump_load_kw >= 0),
    execution_status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (execution_status IN ('SCHEDULED', 'EXECUTING', 'COMPLETED', 'SKIPPED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_item_time_window CHECK (planned_end_time > planned_start_time)
);
