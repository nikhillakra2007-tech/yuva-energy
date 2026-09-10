-- Migration: 022_views.sql
-- Purpose: Read-heavy high performance operational views for farmer dashboard and mobile application.
-- Domain: Database Views

-- ============================================================================
-- 1. Field Operational Summary View (v_current_field_state)
-- Synthesizes field boundary, active crop cycle, latest stage, and water condition
-- ============================================================================
CREATE OR REPLACE VIEW public.v_current_field_state AS
SELECT
    f.id AS field_id,
    f.farm_id,
    fm.user_id,
    f.name AS field_name,
    f.area_hectares,
    f.polygon_source,
    cc.id AS active_crop_cycle_id,
    c.name AS crop_name,
    c.code AS crop_code,
    cv.name AS crop_variety_name,
    cc.season,
    cc.sowing_date,
    cgs.stage_code AS current_growth_stage,
    cgs.kc_coefficient AS current_kc,
    fs.current_ndvi,
    fs.current_soil_moisture_vwc,
    fs.water_stress_index_cwsi,
    fs.data_completeness_score,
    fs.overall_confidence_score,
    fs.evaluated_at AS state_evaluated_at
FROM public.fields f
JOIN public.farms fm ON f.farm_id = fm.id
LEFT JOIN public.crop_cycles cc ON f.id = cc.field_id AND cc.status = 'ACTIVE'
LEFT JOIN public.crops c ON cc.crop_id = c.id
LEFT JOIN public.crop_varieties cv ON cc.crop_variety_id = cv.id
LEFT JOIN LATERAL (
    SELECT growth_stage_id FROM public.crop_stage_observations
    WHERE crop_cycle_id = cc.id
    ORDER BY observed_at DESC LIMIT 1
) latest_stage ON true
LEFT JOIN public.crop_growth_stages cgs ON latest_stage.growth_stage_id = cgs.id
LEFT JOIN LATERAL (
    SELECT * FROM public.farm_states
    WHERE field_id = f.id
    ORDER BY evaluated_at DESC LIMIT 1
) fs ON true
WHERE f.is_active = true;

-- ============================================================================
-- 2. Latest Weather per Field (v_latest_weather)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_latest_weather AS
SELECT DISTINCT ON (f.id)
    f.id AS field_id,
    f.name AS field_name,
    wo.observed_at,
    wo.temperature_celsius,
    wo.relative_humidity_percentage,
    wo.precipitation_mm,
    wo.solar_radiation_mj_m2,
    wo.wind_speed_m_s,
    wo.reference_et0_mm,
    wo.provenance,
    wo.data_quality_flag,
    ws.name AS weather_source_name
FROM public.fields f
JOIN public.weather_observations wo ON f.id = wo.field_id
JOIN public.weather_sources ws ON wo.weather_source_id = ws.id
ORDER BY f.id, wo.observed_at DESC;

-- ============================================================================
-- 3. Latest Satellite Canopy Indices per Field (v_latest_satellite_indices)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_latest_satellite_indices AS
SELECT DISTINCT ON (f.id)
    f.id AS field_id,
    f.name AS field_name,
    so.acquired_at,
    so.cloud_cover_field_percentage,
    vi.mean_value AS latest_ndvi,
    vi.confidence_score AS ndvi_confidence,
    sc.collection_code AS satellite_product
FROM public.fields f
JOIN public.satellite_observations so ON f.id = so.field_id
JOIN public.vegetation_indices vi ON so.id = vi.satellite_observation_id AND vi.index_code = 'NDVI'
JOIN public.satellite_scenes ss ON so.scene_id = ss.id
JOIN public.satellite_collections sc ON ss.collection_id = sc.id
WHERE so.data_quality_status = 'VALID'
ORDER BY f.id, so.acquired_at DESC;

-- ============================================================================
-- 4. Active Actionable Farmer Recommendations (v_active_irrigation_recommendations)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_active_irrigation_recommendations AS
SELECT
    r.id AS recommendation_id,
    r.field_id,
    f.name AS field_name,
    fm.id AS farm_id,
    fm.name AS farm_name,
    fm.user_id,
    r.action_type,
    r.title,
    r.message_vernacular,
    r.language_code,
    r.action_window_start,
    r.action_window_end,
    r.recommended_duration_minutes,
    r.recommended_volume_litres,
    r.estimated_solar_energy_pct,
    r.estimated_cost_savings_inr,
    r.urgency_level,
    r.status,
    r.confidence_score,
    r.created_at,
    p.name AS pump_name,
    p.rated_power_hp AS pump_hp
FROM public.recommendations r
JOIN public.fields f ON r.field_id = f.id
JOIN public.farms fm ON f.farm_id = fm.id
LEFT JOIN public.irrigation_schedules sch ON r.irrigation_schedule_id = sch.id
LEFT JOIN LATERAL (
    SELECT pump_id FROM public.irrigation_schedule_items
    WHERE irrigation_schedule_id = sch.id
    LIMIT 1
) item ON true
LEFT JOIN public.pumps p ON item.pump_id = p.id
WHERE r.status IN ('PENDING', 'VIEWED', 'ACCEPTED')
ORDER BY r.urgency_level DESC, r.action_window_start ASC;
