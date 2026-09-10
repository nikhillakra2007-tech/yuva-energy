-- Migration: 014_recommendations.sql
-- Purpose: Farmer-facing actionable recommendations, structured reasons, and farmer feedback loops.
-- Domain: Domain 11 — Recommendations & Farmer Interaction

-- Farmer Actionable Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    irrigation_schedule_id UUID REFERENCES public.irrigation_schedules(id) ON DELETE SET NULL,
    optimization_run_id UUID REFERENCES public.optimization_runs(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('SCHEDULE_IRRIGATION', 'IRRIGATE_IMMEDIATELY', 'HOLD_FOR_RAIN', 'SKIP_IRRIGATION', 'CHECK_SOIL_DRAINAGE', 'TARIFF_ALERT')),
    title TEXT NOT NULL,
    message_vernacular TEXT NOT NULL, -- Farmer-facing vernacular text (e.g. Hindi: "Paani kal subah 6 baje 45 minute ke liye chalayein")
    language_code TEXT NOT NULL DEFAULT 'hi',
    action_window_start TIMESTAMPTZ NOT NULL,
    action_window_end TIMESTAMPTZ NOT NULL,
    recommended_duration_minutes NUMERIC(6, 1) CHECK (recommended_duration_minutes IS NULL OR recommended_duration_minutes >= 0),
    recommended_volume_litres NUMERIC(12, 2) CHECK (recommended_volume_litres IS NULL OR recommended_volume_litres >= 0),
    estimated_solar_energy_pct NUMERIC(5, 2) CHECK (estimated_solar_energy_pct IS NULL OR (estimated_solar_energy_pct >= 0 AND estimated_solar_energy_pct <= 100)),
    estimated_cost_savings_inr NUMERIC(8, 2) CHECK (estimated_cost_savings_inr IS NULL OR estimated_cost_savings_inr >= 0),
    urgency_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (urgency_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 0.850 CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_rec_window CHECK (action_window_end >= action_window_start)
);

-- Structured Explanatory Reasons for Recommendation
CREATE TABLE IF NOT EXISTS public.recommendation_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('WEATHER_FORECAST', 'SOLAR_GENERATION_PEAK', 'SOIL_MOISTURE_DEFICIT', 'CROP_CRITICAL_STAGE', 'OFF_PEAK_TARIFF', 'HEAT_STRESS')),
    headline TEXT NOT NULL,
    detail_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Farmer Feedback & Compliance Logging
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    action_taken TEXT NOT NULL CHECK (action_taken IN ('FOLLOWED_EXACTLY', 'FOLLOWED_PARTIALLY', 'DEFERRED', 'REJECTED_DISAGREED', 'REJECTED_INFRA_ISSUE')),
    feedback_rating INTEGER CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5)),
    rejection_reason_code TEXT CHECK (rejection_reason_code IN ('PUMP_FAILURE', 'POWER_OUTAGE', 'UNEXPECTED_RAIN', 'CANAL_WATER_UNAVAILABLE', 'LABOUR_SHORTAGE', 'SOIL_STILL_WET', 'OTHER')),
    actual_irrigation_duration_minutes NUMERIC(6, 1),
    farmer_comments TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
