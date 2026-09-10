-- Migration: 019_triggers.sql
-- Purpose: Spatial automation triggers and updated_at timestamp triggers.
-- Domain: Database Triggers

-- ============================================================================
-- 1. Spatial Boundary Auto-Computation Triggers
-- ============================================================================
DROP TRIGGER IF EXISTS trg_fields_spatial_sync ON public.fields;
CREATE TRIGGER trg_fields_spatial_sync
    BEFORE INSERT OR UPDATE OF boundary
    ON public.fields
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_field_spatial_attributes();

-- ============================================================================
-- 2. Timestamp (updated_at) Auto-Refresh Triggers
-- ============================================================================
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_farms_updated_at ON public.farms;
CREATE TRIGGER trg_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_administrative_areas_updated_at ON public.administrative_areas;
CREATE TRIGGER trg_administrative_areas_updated_at
    BEFORE UPDATE ON public.administrative_areas
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_fields_updated_at ON public.fields;
CREATE TRIGGER trg_fields_updated_at
    BEFORE UPDATE ON public.fields
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_crops_updated_at ON public.crops;
CREATE TRIGGER trg_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_crop_varieties_updated_at ON public.crop_varieties;
CREATE TRIGGER trg_crop_varieties_updated_at
    BEFORE UPDATE ON public.crop_varieties
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_crop_cycles_updated_at ON public.crop_cycles;
CREATE TRIGGER trg_crop_cycles_updated_at
    BEFORE UPDATE ON public.crop_cycles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_irrigation_systems_updated_at ON public.irrigation_systems;
CREATE TRIGGER trg_irrigation_systems_updated_at
    BEFORE UPDATE ON public.irrigation_systems
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_energy_systems_updated_at ON public.energy_systems;
CREATE TRIGGER trg_energy_systems_updated_at
    BEFORE UPDATE ON public.energy_systems
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();
