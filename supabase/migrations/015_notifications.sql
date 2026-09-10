-- Migration: 015_notifications.sql
-- Purpose: Multi-channel delivery, outbound notifications, and farmer vernacular preferences.
-- Domain: Domain 13 — Notifications & User Interaction

-- Notification Delivery Channels
CREATE TABLE IF NOT EXISTS public.notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (code IN ('IN_APP', 'SMS', 'WHATSAPP', 'VOICE_IVR', 'EMAIL')),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Outbound Notifications Log
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
    channel_id UUID NOT NULL REFERENCES public.notification_channels(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    message_content TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (delivery_status IN ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
    external_provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Farmer Localization & Notification Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK (preferred_language IN ('hi', 'en', 'mr', 'te', 'pa', 'bn', 'ta', 'gu', 'kn')),
    preferred_channel_id UUID REFERENCES public.notification_channels(id) ON DELETE SET NULL,
    unit_system TEXT NOT NULL DEFAULT 'METRIC' CHECK (unit_system IN ('METRIC', 'CUSTOMARY')),
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '05:30:00',
    notify_irrigation_alerts BOOLEAN NOT NULL DEFAULT true,
    notify_solar_peak_opportunities BOOLEAN NOT NULL DEFAULT true,
    notify_weather_warnings BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
