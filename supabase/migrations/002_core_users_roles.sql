-- Migration: 002_core_users_roles.sql
-- Purpose: User identity reference, system roles, and user-role assignments.
-- Domain: Domain 1 — User & Access

-- Master Roles reference table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Application Users table
-- Links to Supabase auth.users(id) via UUID without hard FK to allow flexible deployment & testing
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- References auth.users(id) when authenticated through Supabase Auth
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT UNIQUE,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- User Roles Junction table (N:N relationship)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);
