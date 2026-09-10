-- Migration: 020_rls.sql
-- Purpose: Multi-tenant isolation and Row Level Security (RLS) policies.
-- Domain: Security & Access Control

-- ============================================================================
-- 1. Helper function to map Supabase auth.uid() to public.users(id)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID AS $$
    SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 2. Enable RLS on User Holdings & Operational Tables
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_stage_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Reference Tables: Enable RLS with Public Read
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_growth_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_definitions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Reference Tables Read Policies (Public to authenticated & anon)
-- ============================================================================
CREATE POLICY "Public read for roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Public read for crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Public read for crop_varieties" ON public.crop_varieties FOR SELECT USING (true);
CREATE POLICY "Public read for crop_growth_stages" ON public.crop_growth_stages FOR SELECT USING (true);
CREATE POLICY "Public read for crop_parameters" ON public.crop_parameters FOR SELECT USING (true);
CREATE POLICY "Public read for weather_sources" ON public.weather_sources FOR SELECT USING (true);
CREATE POLICY "Public read for satellite_sources" ON public.satellite_sources FOR SELECT USING (true);
CREATE POLICY "Public read for satellite_collections" ON public.satellite_collections FOR SELECT USING (true);
CREATE POLICY "Public read for soil_sources" ON public.soil_sources FOR SELECT USING (true);
CREATE POLICY "Public read for water_sources" ON public.water_sources FOR SELECT USING (true);
CREATE POLICY "Public read for irrigation_methods" ON public.irrigation_methods FOR SELECT USING (true);
CREATE POLICY "Public read for energy_sources" ON public.energy_sources FOR SELECT USING (true);
CREATE POLICY "Public read for notification_channels" ON public.notification_channels FOR SELECT USING (true);
CREATE POLICY "Public read for feature_definitions" ON public.feature_definitions FOR SELECT USING (true);

-- ============================================================================
-- 4. User Profile & Preferences Policies
-- ============================================================================
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth_id = auth.uid() OR id = public.current_app_user_id());

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth_id = auth.uid() OR id = public.current_app_user_id());

CREATE POLICY "Users can manage their preferences" ON public.user_preferences
    FOR ALL USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ============================================================================
-- 5. Farm & Field Tenant Isolation Policies
-- ============================================================================
CREATE POLICY "Farmers can view own farms" ON public.farms
    FOR SELECT USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Farmers can insert own farms" ON public.farms
    FOR INSERT WITH CHECK (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Farmers can update own farms" ON public.farms
    FOR UPDATE USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Farmers can view own fields" ON public.fields
    FOR SELECT USING (farm_id IN (
        SELECT id FROM public.farms WHERE user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    ));

CREATE POLICY "Farmers can manage own fields" ON public.fields
    FOR ALL USING (farm_id IN (
        SELECT id FROM public.farms WHERE user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    ));

-- ============================================================================
-- 6. Recommendations & Feedback Isolation Policies
-- ============================================================================
CREATE POLICY "Farmers can view their field recommendations" ON public.recommendations
    FOR SELECT USING (field_id IN (
        SELECT f.id FROM public.fields f
        JOIN public.farms fm ON f.farm_id = fm.id
        WHERE fm.user_id = public.current_app_user_id() OR fm.user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    ));

CREATE POLICY "Farmers can update their recommendations" ON public.recommendations
    FOR UPDATE USING (field_id IN (
        SELECT f.id FROM public.fields f
        JOIN public.farms fm ON f.farm_id = fm.id
        WHERE fm.user_id = public.current_app_user_id() OR fm.user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    ));

CREATE POLICY "Farmers can submit recommendation feedback" ON public.recommendation_feedback
    FOR ALL USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Farmers can view their notifications" ON public.notifications
    FOR SELECT USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
