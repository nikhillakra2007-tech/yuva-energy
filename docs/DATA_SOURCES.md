# Data sources

No source is integrated yet. Seed registrations are not evidence of API access.

| Source | Existing SQL registration | Pending work |
| --- | --- | --- |
| Open-Meteo | weather_sources | Historical/forecast contracts, units, retries, deduplication, attribution |
| ERA5-Land | weather_sources | Access/licensing and reanalysis provenance |
| IMD AWS | weather_sources | Actual data-access agreement/API verification |
| Copernicus ESA / Sentinel-2 L2A | satellite_sources, satellite_collections | STAC/provider access, field intersection, cloud mask, reflectance scaling, NDVI/EVI |
| ISRIC SoilGrids | soil_sources | Availability, depth/units conversion, uncertainty and fallback |
| Soil Health Card | soil_sources | User upload/input workflow and verifiable provenance |
| FAO-56-inspired crop/irrigation constants | crops, growth stages, parameters, methods | Per-value citations and local assumptions; not field measurements |
| Energy/emission constants | energy_sources | Verify source/year and label estimates |

The generic data_sources, endpoints, jobs and lineage tables are empty by default. Never treat reanalysis, forecast or calculated values as physical sensor measurements. No observation or ML metric was fabricated in this audit.
