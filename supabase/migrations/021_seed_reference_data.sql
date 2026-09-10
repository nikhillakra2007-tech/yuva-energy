-- Migration: 021_seed_reference_data.sql
-- Purpose: Canonical reference data for agronomic taxonomies, FAO-56 stage parameters, irrigation methods, and energy types.
-- Domain: Reference Seed Data (NO FAKE TELEMETRY)

-- 1. Master System Roles
INSERT INTO public.roles (code, name, description) VALUES
('FARMER', 'Farmer / Cultivator', 'Primary agricultural landholder and irrigation decision maker'),
('AGRONOMIST', 'Agronomist / Extension Officer', 'Agricultural advisor providing crop and soil advisory'),
('ADMIN', 'System Administrator', 'Platform operator and infrastructure manager'),
('RESEARCHER', 'Agricultural Researcher / Data Scientist', 'ML engineer or researcher analyzing anonymized agronomic performance'),
('SYSTEM', 'System Service Account', 'Automated backend worker executing ingestion and optimization jobs')
ON CONFLICT (code) DO NOTHING;

-- 2. Master Water Sources
INSERT INTO public.water_sources (code, name, source_type, reliability_tier) VALUES
('BOREWELL_DEEP', 'Deep Aquifer Borewell', 'BOREWELL', 'HIGH'),
('OPEN_WELL', 'Dug Well / Open Well', 'OPEN_WELL', 'SEASONAL'),
('CANAL_GRAVITY', 'Irrigation Canal Gravity Feeder', 'CANAL', 'SEASONAL'),
('FARM_POND', 'On-Farm Rainwater Harvesting Pond', 'FARM_POND', 'SEASONAL'),
('RIVER_LIFT', 'River / Stream Lift Irrigation', 'RIVER', 'INTERMITTENT')
ON CONFLICT (code) DO NOTHING;

-- 3. Master Irrigation Methods with FAO standard efficiencies
INSERT INTO public.irrigation_methods (code, name, category, typical_application_efficiency_pct, wetting_fraction_fw, description) VALUES
('DRIP_SURFACE', 'Surface Drip Irrigation', 'MICRO_IRRIGATION', 90.0, 0.40, 'High-efficiency localized emitter tubing delivering water directly to root-zone'),
('MICRO_SPRINKLER', 'Micro Sprinkler System', 'MICRO_IRRIGATION', 85.0, 0.70, 'Low-pressure micro sprinklers with moderate canopy coverage'),
('PORTABLE_SPRINKLER', 'Overhead Portable Sprinkler', 'PRESSURIZED_OVERHEAD', 75.0, 1.00, 'Impact sprinkler nozzles pressurized via mainline pipeline'),
('FURROW_SURFACE', 'Furrow Irrigation', 'SURFACE_GRAVITY', 60.0, 0.80, 'Water conveyed through trenches between ridges'),
('FLOOD_BASIN', 'Check Basin / Flood Irrigation', 'SURFACE_GRAVITY', 50.0, 1.00, 'Traditional flood irrigation with high evaporative and conveyance loss')
ON CONFLICT (code) DO NOTHING;

-- 4. Master Energy Sources
INSERT INTO public.energy_sources (code, name, source_category, emission_factor_kg_co2_per_kwh, is_renewable) VALUES
('GRID_AGRICULTURAL', 'Utility Grid (Agricultural Feeder)', 'GRID_UTILITY', 0.8200, false),
('SOLAR_PV_OFFGRID', 'Off-Grid Solar PV Array', 'SOLAR_PHOTOVOLTAIC', 0.0000, true),
('SOLAR_PV_GRID_TIED', 'Grid-Interactive Solar PV Array', 'SOLAR_PHOTOVOLTAIC', 0.0000, true),
('BATTERY_BESS', 'Solar Battery Energy Storage System', 'BATTERY_STORAGE', 0.0500, true),
('DIESEL_GENSET', 'Diesel Engine / Genset', 'DIESEL_GENERATOR', 1.0500, false)
ON CONFLICT (code) DO NOTHING;

-- 5. Notification Channels
INSERT INTO public.notification_channels (code, name, description) VALUES
('IN_APP', 'In-App Dashboard Notification', 'Alert displayed directly within the web/mobile farmer interface'),
('WHATSAPP', 'WhatsApp Message', 'Vernacular notification sent via official WhatsApp Business API'),
('SMS', 'Direct SMS', 'Text message for basic feature-phone delivery'),
('VOICE_IVR', 'Automated Voice Call (IVR)', 'Automated voice call for low-literacy advisory delivery'),
('EMAIL', 'Email Report', 'Comprehensive seasonal summary or researcher audit export')
ON CONFLICT (code) DO NOTHING;

-- 6. Master Weather Data Sources
INSERT INTO public.weather_sources (code, name, provider_type, base_url, attribution) VALUES
('OPEN_METEO', 'Open-Meteo Weather API', 'API', 'https://api.open-meteo.com/v1', 'Weather data by Open-Meteo.com (CC BY 4.0)'),
('ERA5_LAND', 'ECMWF ERA5-Land Reanalysis', 'SATELLITE_REANALYSIS', 'https://cds.climate.copernicus.eu', 'Copernicus Climate Change Service'),
('IMD_AWS', 'India Meteorological Department (AWS)', 'GOVERNMENT_STATION', 'https://mausam.imd.gov.in', 'IMD Ministry of Earth Sciences, Govt of India')
ON CONFLICT (code) DO NOTHING;

-- 7. Master Satellite Constellations & Collections
INSERT INTO public.satellite_sources (code, name, operator, description) VALUES
('COPERNICUS_ESA', 'European Space Agency Copernicus', 'ESA', 'European Union Earth Observation Programme')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.satellite_collections (source_id, collection_code, name, spatial_resolution_meters, revisit_interval_days) VALUES
((SELECT id FROM public.satellite_sources WHERE code = 'COPERNICUS_ESA'), 'SENTINEL_2_L2A', 'Sentinel-2 MSI Level-2A Surface Reflectance', 10.0, 5.0)
ON CONFLICT (collection_code) DO NOTHING;

-- 8. Master Soil Sources
INSERT INTO public.soil_sources (code, name, source_type, attribution) VALUES
('SOILGRIDS_ISRIC', 'SoilGrids 250m Global Database', 'GLOBAL_DATABASE', 'ISRIC — World Soil Information (CC-BY 4.0)'),
('GOVT_SOIL_HEALTH_CARD', 'Soil Health Card Scheme', 'GOVERNMENT_SURVEY', 'Ministry of Agriculture and Farmers Welfare, Govt of India')
ON CONFLICT (code) DO NOTHING;

-- 9. Master Crops Catalog
INSERT INTO public.crops (code, name, botanical_name, crop_category, default_season, water_demand_category, typical_duration_days) VALUES
('WHEAT', 'Wheat', 'Triticum aestivum', 'CEREAL', 'RABI', 'MEDIUM', 125),
('RICE_PADDY', 'Rice (Paddy)', 'Oryza sativa', 'CEREAL', 'KHARIF', 'VERY_HIGH', 135),
('MAIZE', 'Maize (Corn)', 'Zea mays', 'CEREAL', 'ALL_SEASON', 'MEDIUM', 105),
('TOMATO', 'Tomato', 'Solanum lycopersicum', 'VEGETABLE', 'RABI', 'HIGH', 115),
('POTATO', 'Potato', 'Solanum tuberosum', 'VEGETABLE', 'RABI', 'MEDIUM', 95),
('COTTON', 'Cotton', 'Gossypium hirsutum', 'CASH_CROP', 'KHARIF', 'HIGH', 160)
ON CONFLICT (code) DO NOTHING;

-- 10. FAO-56 Crop Growth Stages & Parameters
-- Wheat
INSERT INTO public.crop_growth_stages (crop_id, stage_code, stage_name, stage_order, typical_duration_days, kc_coefficient, rooting_depth_meters, depletion_fraction_p) VALUES
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'INITIAL', 'Initial / Germination', 1, 20, 0.40, 0.30, 0.55),
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'DEVELOPMENT', 'Crop Development / Tillering', 2, 30, 0.80, 0.60, 0.55),
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'MID_SEASON', 'Mid-Season / Flowering & Heading', 3, 45, 1.15, 1.10, 0.55),
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'LATE_SEASON', 'Late Season / Ripening', 4, 30, 0.40, 1.10, 0.80)
ON CONFLICT (crop_id, stage_code) DO NOTHING;

-- Rice (Paddy)
INSERT INTO public.crop_growth_stages (crop_id, stage_code, stage_name, stage_order, typical_duration_days, kc_coefficient, rooting_depth_meters, depletion_fraction_p) VALUES
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'INITIAL', 'Initial / Nursery & Transplanting', 1, 25, 1.05, 0.20, 0.20),
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'DEVELOPMENT', 'Vegetative / Tillering', 2, 35, 1.10, 0.40, 0.20),
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'MID_SEASON', 'Reproductive / Panicle & Flowering', 3, 50, 1.20, 0.60, 0.20),
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'LATE_SEASON', 'Maturation / Grain Filling', 4, 25, 0.90, 0.60, 0.40)
ON CONFLICT (crop_id, stage_code) DO NOTHING;

-- Tomato
INSERT INTO public.crop_growth_stages (crop_id, stage_code, stage_name, stage_order, typical_duration_days, kc_coefficient, rooting_depth_meters, depletion_fraction_p) VALUES
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'INITIAL', 'Initial / Establishment', 1, 25, 0.60, 0.25, 0.40),
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'DEVELOPMENT', 'Vegetative Growth', 2, 35, 0.85, 0.50, 0.40),
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'MID_SEASON', 'Flowering & Fruit Set', 3, 40, 1.15, 0.80, 0.40),
((SELECT id FROM public.crops WHERE code = 'LATE_SEASON'), 'Harvest / Ripening', 4, 20, 0.80, 0.80, 0.50)
ON CONFLICT DO NOTHING;

-- FAO-56 Base Parameters for Wheat and Rice
INSERT INTO public.crop_parameters (crop_id, version_tag, kc_initial, kc_mid, kc_end, min_root_depth_meters, max_root_depth_meters, critical_depletion_fraction_p, yield_response_factor_ky, max_height_meters) VALUES
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'FAO-56-DEFAULT', 0.40, 1.15, 0.40, 0.30, 1.20, 0.55, 1.05, 1.00),
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'FAO-56-DEFAULT', 1.05, 1.20, 0.90, 0.20, 0.60, 0.20, 1.10, 1.00),
((SELECT id FROM public.crops WHERE code = 'MAIZE'), 'FAO-56-DEFAULT', 0.30, 1.20, 0.50, 0.30, 1.20, 0.55, 1.25, 2.00),
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'FAO-56-DEFAULT', 0.60, 1.15, 0.80, 0.25, 1.00, 0.40, 1.05, 0.80)
ON CONFLICT DO NOTHING;
