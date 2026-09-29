import hashlib
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import psycopg
from psycopg.rows import dict_row

from backend.app.ingestion.base import DataMode
from backend.app.ingestion.weather_provider import OpenMeteoWeatherProvider
from backend.app.ingestion.soil_provider import SoilGridsProvider
from backend.app.ingestion.satellite_provider import Sentinel2SatelliteProvider

logger = logging.getLogger(__name__)

class IngestionPipelineService:
    def __init__(self):
        self.weather_provider = OpenMeteoWeatherProvider()
        self.soil_provider = SoilGridsProvider()
        self.satellite_provider = Sentinel2SatelliteProvider()

    def _ensure_job_id(self, conn: psycopg.Connection, source_code: str, domain: str) -> uuid.UUID:
        """Finds or registers the ingestion job entry for a given domain source."""
        domain_mapping = {
            "WEATHER": ("WEATHER", "WEATHER_OBSERVATION", "Open-Meteo Weather API"),
            "SOIL": ("SOIL", "SOILGRIDS", "SoilGrids 250m Database"),
            "SATELLITE": ("SATELLITE", "SATELLITE_SCENE", "Copernicus Sentinel-2")
        }
        category, db_domain, default_name = domain_mapping.get(domain, (domain, domain, source_code))

        with conn.cursor() as cur:
            cur.execute("SELECT id FROM data_sources WHERE code = %s", (source_code,))
            row = cur.fetchone()
            if row:
                source_id = row["id"] if isinstance(row, dict) else row[0]
            else:
                source_id = uuid.uuid4()
                cur.execute(
                    """
                    INSERT INTO data_sources (id, code, name, domain_category, reliability_score, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (source_id, source_code, default_name, category, 0.95, True)
                )

            cur.execute(
                "SELECT id FROM ingestion_jobs WHERE target_domain = %s AND data_source_id = %s",
                (db_domain, source_id)
            )
            job = cur.fetchone()
            if job:
                return job["id"] if isinstance(job, dict) else job[0]

            job_id = uuid.uuid4()
            cur.execute(
                """
                INSERT INTO ingestion_jobs (id, data_source_id, job_name, target_domain, cron_schedule, timeout_seconds, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (job_id, source_id, f"Auto-Sync {domain} ({source_code})", db_domain, "0 * * * *", 60, True)
            )
            return job_id

    def sync_field_data(
        self,
        conn: psycopg.Connection,
        field_id: str,
        domains: Optional[List[str]] = None,
        force_mode: Optional[DataMode] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates an ingestion cycle for a specific field across requested domains.
        Guarantees:
        - Exact raw data payload retention with SHA-256 hash.
        - Idempotent deduplication against existing records.
        - Complete data provenance tracking.
        """
        target_domains = domains or ["WEATHER", "SOIL", "SATELLITE"]
        results = {}

        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT 
                    id, 
                    farm_id, 
                    name, 
                    ST_AsGeoJSON(boundary) as boundary_geojson,
                    ST_Y(ST_Centroid(boundary::geometry)) as centroid_lat,
                    ST_X(ST_Centroid(boundary::geometry)) as centroid_lon
                FROM fields
                WHERE id = %s
                """,
                (field_id,)
            )
            field = cur.fetchone()
            if not field:
                raise ValueError(f"Field {field_id} not found")

            lat = float(field["centroid_lat"])
            lon = float(field["centroid_lon"])
            geom_json = json.loads(field["boundary_geojson"]) if field["boundary_geojson"] else None

        for domain in target_domains:
            if domain == "WEATHER":
                results["weather"] = self._sync_weather(conn, field_id, lat, lon, force_mode)
            elif domain == "SOIL":
                results["soil"] = self._sync_soil(conn, field_id, lat, lon, force_mode)
            elif domain == "SATELLITE":
                results["satellite"] = self._sync_satellite(conn, field_id, geom_json, force_mode)

        return {
            "field_id": field_id,
            "field_name": field["name"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "domains_synced": target_domains,
            "summary": results
        }

    def _sync_weather(
        self, conn: psycopg.Connection, field_id: str, lat: float, lon: float, force_mode: Optional[DataMode]
    ) -> Dict[str, Any]:
        job_id = self._ensure_job_id(conn, "OPEN_METEO", "WEATHER")
        run_id = uuid.uuid4()
        started_at = datetime.now(timezone.utc)

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ingestion_runs (id, ingestion_job_id, started_at, status, records_received, records_persisted)
                VALUES (%s, %s, %s, %s, 0, 0)
                """,
                (run_id, job_id, started_at, "RUNNING")
            )

        try:
            records, forecast, prov = self.weather_provider.fetch_and_normalize(lat, lon)
            if force_mode:
                prov.mode = force_mode

            # Archive raw payload
            raw_payload = {
                "records": [r.model_dump(mode="json") for r in records],
                "forecast": forecast,
                "provenance": prov.model_dump(mode="json")
            }
            raw_str = json.dumps(raw_payload, sort_keys=True, default=str)
            checksum = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO raw_data_records (id, ingestion_run_id, external_record_identifier, payload, checksum_sha256, ingested_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (uuid.uuid4(), run_id, f"WEATHER-{field_id}-{started_at.strftime('%Y%m%d%H%M')}", raw_str, checksum, started_at)
                )

                cur.execute("SELECT id FROM weather_sources WHERE code = 'OPEN_METEO'")
                w_row = cur.fetchone()
                weather_source_id = w_row["id"] if isinstance(w_row, dict) else w_row[0]

                persisted_count = 0
                for rec in records:
                    # Check deduplication
                    cur.execute(
                        "SELECT id FROM weather_observations WHERE field_id = %s AND observed_at = %s",
                        (field_id, rec.observed_at)
                    )
                    existing = cur.fetchone()
                    if existing:
                        continue

                    cur.execute(
                        """
                        INSERT INTO weather_observations (
                            id, field_id, weather_source_id, observed_at,
                            temperature_celsius, relative_humidity_percentage,
                            precipitation_mm, solar_radiation_mj_m2,
                            wind_speed_m_s, reference_et0_mm,
                            provenance, data_quality_flag
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            uuid.uuid4(), field_id, weather_source_id, rec.observed_at,
                            rec.temperature_celsius, rec.relative_humidity_percentage,
                            rec.precipitation_mm, rec.solar_radiation_mj_m2,
                            rec.wind_speed_m_s, rec.reference_et0_mm,
                            "EXTERNAL_RETRIEVED", rec.data_quality_flag
                        )
                    )
                    persisted_count += 1

                cur.execute(
                    """
                    UPDATE ingestion_runs
                    SET completed_at = %s, status = 'COMPLETED', records_received = %s, records_persisted = %s, http_status_code = 200
                    WHERE id = %s
                    """,
                    (datetime.now(timezone.utc), len(records), persisted_count, run_id)
                )

            return {
                "status": "COMPLETED",
                "received": len(records),
                "persisted": persisted_count,
                "data_mode": prov.mode.value,
                "provenance": prov.source_name
            }

        except Exception as e:
            logger.error(f"Weather sync failed for field {field_id}: {e}", exc_info=True)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE ingestion_runs
                    SET completed_at = %s, status = 'FAILED', error_summary = %s
                    WHERE id = %s
                    """,
                    (datetime.now(timezone.utc), str(e), run_id)
                )
            return {"status": "FAILED", "error": str(e)}

    def _sync_soil(
        self, conn: psycopg.Connection, field_id: str, lat: float, lon: float, force_mode: Optional[DataMode]
    ) -> Dict[str, Any]:
        job_id = self._ensure_job_id(conn, "SOILGRIDS_ISRIC", "SOIL")
        run_id = uuid.uuid4()
        started_at = datetime.now(timezone.utc)

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ingestion_runs (id, ingestion_job_id, started_at, status, records_received, records_persisted)
                VALUES (%s, %s, %s, %s, 0, 0)
                """,
                (run_id, job_id, started_at, "RUNNING")
            )

        try:
            record, prov = self.soil_provider.fetch_and_normalize(lat, lon)
            if force_mode:
                prov.mode = force_mode

            raw_payload = {
                "record": record.model_dump(mode="json"),
                "provenance": prov.model_dump(mode="json")
            }
            raw_str = json.dumps(raw_payload, sort_keys=True, default=str)
            checksum = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO raw_data_records (id, ingestion_run_id, external_record_identifier, payload, checksum_sha256, ingested_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (uuid.uuid4(), run_id, f"SOIL-{field_id}-{started_at.strftime('%Y%m%d')}", raw_str, checksum, started_at)
                )

                cur.execute("SELECT id FROM soil_sources WHERE code = 'SOILGRIDS_ISRIC'")
                s_row = cur.fetchone()
                soil_source_id = s_row["id"] if isinstance(s_row, dict) else s_row[0]

                # Check if soil observation exists within last 7 days to prevent duplicate profile insertion
                cur.execute(
                    """
                    SELECT id FROM soil_observations
                    WHERE field_id = %s AND observed_at >= %s - INTERVAL '7 days'
                    ORDER BY observed_at DESC LIMIT 1
                    """,
                    (field_id, started_at)
                )
                existing = cur.fetchone()
                persisted = 0
                if not existing:
                    cur.execute(
                        """
                        INSERT INTO soil_observations (
                            id, field_id, soil_source_id, observed_at,
                            soil_texture_class, sand_percentage, silt_percentage, clay_percentage,
                            organic_carbon_percentage, ph, bulk_density_g_cm3,
                            field_capacity_vwc, wilting_point_vwc, saturation_vwc,
                            available_water_capacity_mm_per_m, profile_depth_top_cm, profile_depth_bottom_cm,
                            provenance
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            uuid.uuid4(), field_id, soil_source_id, record.observed_at,
                            record.soil_texture_class, record.sand_percentage, record.silt_percentage, record.clay_percentage,
                            record.organic_carbon_percentage, record.ph, record.bulk_density_g_cm3,
                            record.field_capacity_vwc, record.wilting_point_vwc, record.saturation_vwc,
                            record.available_water_capacity_mm_per_m, record.profile_depth_top_cm, record.profile_depth_bottom_cm,
                            "EXTERNAL_RETRIEVED"
                        )
                    )
                    persisted = 1

                cur.execute(
                    """
                    UPDATE ingestion_runs
                    SET completed_at = %s, status = 'COMPLETED', records_received = 1, records_persisted = %s, http_status_code = 200
                    WHERE id = %s
                    """,
                    (datetime.now(timezone.utc), persisted, run_id)
                )

            return {
                "status": "COMPLETED",
                "received": 1,
                "persisted": persisted,
                "data_mode": prov.mode.value,
                "texture": record.soil_texture_class,
                "awc_mm_m": record.available_water_capacity_mm_per_m
            }
        except Exception as e:
            logger.error(f"Soil sync failed for field {field_id}: {e}", exc_info=True)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE ingestion_runs
                    SET completed_at = %s, status = 'FAILED', error_summary = %s
                    WHERE id = %s
                    """,
                    (datetime.now(timezone.utc), str(e), run_id)
                )
            return {"status": "FAILED", "error": str(e)}

    def _sync_satellite(
        self, conn: psycopg.Connection, field_id: str, geom_geojson: Optional[Dict[str, Any]], force_mode: Optional[DataMode]
    ) -> Dict[str, Any]:
        job_id = self._ensure_job_id(conn, "COPERNICUS_ESA", "SATELLITE")
        run_id = uuid.uuid4()
        started_at = datetime.now(timezone.utc)

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ingestion_runs (id, ingestion_job_id, started_at, status, records_received, records_persisted)
                VALUES (%s, %s, %s, %s, 0, 0)
                """,
                (run_id, job_id, started_at, "RUNNING")
            )

        try:
            records, prov = self.satellite_provider.fetch_and_normalize(geom_geojson or {})
            if force_mode:
                prov.mode = force_mode

            raw_payload = {
                "records": [r.model_dump(mode="json") for r in records],
                "provenance": prov.model_dump(mode="json")
            }
            raw_str = json.dumps(raw_payload, sort_keys=True, default=str)
            checksum = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO raw_data_records (id, ingestion_run_id, external_record_identifier, payload, checksum_sha256, ingested_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (uuid.uuid4(), run_id, f"SAT-{field_id}-{started_at.strftime('%Y%m%d')}", raw_str, checksum, started_at)
                )

                cur.execute("SELECT id FROM satellite_collections WHERE collection_code = 'SENTINEL_2_L2A'")
                c_row = cur.fetchone()
                collection_id = c_row["id"] if isinstance(c_row, dict) else c_row[0]

                persisted_scenes = 0
                for rec in records:
                    # 1. Ensure scene exists
                    cur.execute(
                        "SELECT id FROM satellite_scenes WHERE provider_scene_id = %s",
                        (rec.provider_scene_id,)
                    )
                    scene_row = cur.fetchone()
                    if scene_row:
                        scene_id = scene_row["id"] if isinstance(scene_row, dict) else scene_row[0]
                    else:
                        scene_id = uuid.uuid4()
                        cur.execute(
                            """
                            INSERT INTO satellite_scenes (id, collection_id, provider_scene_id, acquired_at, cloud_coverage_percentage, metadata)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            """,
                            (scene_id, collection_id, rec.provider_scene_id, rec.acquired_at, rec.cloud_cover_percentage, json.dumps({}))
                        )

                    # 2. Insert satellite_observation
                    obs_id = uuid.uuid4()
                    cur.execute(
                        """
                        INSERT INTO satellite_observations (
                            id, field_id, scene_id, acquired_at,
                            cloud_cover_field_percentage, valid_pixel_percentage,
                            data_quality_status, provenance
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (field_id, scene_id) DO NOTHING
                        RETURNING id
                        """,
                        (
                            obs_id, field_id, scene_id, rec.acquired_at,
                            rec.cloud_cover_percentage, rec.valid_pixel_percentage,
                            "VALID" if rec.cloud_cover_percentage <= 30 else "CLOUDY",
                            "EXTERNAL_RETRIEVED"
                        )
                    )
                    inserted_obs = cur.fetchone()
                    if inserted_obs:
                        actual_obs_id = inserted_obs["id"] if isinstance(inserted_obs, dict) else inserted_obs[0]
                        persisted_scenes += 1

                        # 3. Insert vegetation indices (NDVI, EVI, NDRE)
                        for code, val in [
                            ("NDVI", rec.ndvi_mean),
                            ("EVI", rec.evi_mean),
                            ("NDRE", rec.ndre_mean)
                        ]:
                            if val is not None:
                                cur.execute(
                                    """
                                    INSERT INTO vegetation_indices (
                                        id, satellite_observation_id, field_id, index_code,
                                        mean_value, median_value, min_value, max_value,
                                        confidence_score, acquired_at
                                    )
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                    ON CONFLICT (satellite_observation_id, index_code) DO NOTHING
                                    """,
                                    (
                                        uuid.uuid4(), actual_obs_id, field_id, code,
                                        val, rec.ndvi_median or val, rec.ndvi_min, rec.ndvi_max,
                                        rec.confidence_score, rec.acquired_at
                                    )
                                )

                cur.execute(
                    """
                    UPDATE ingestion_runs
                    SET completed_at = %s, status = 'COMPLETED', records_received = %s, records_persisted = %s, http_status_code = 200
                    WHERE id = %s
                    """,
                    (datetime.now(timezone.utc), len(records), persisted_scenes, run_id)
                )

            return {
                "status": "COMPLETED",
                "received": len(records),
                "persisted": persisted_scenes,
                "data_mode": prov.mode.value,
                "latest_ndvi": records[-1].ndvi_mean if records else None
            }
        except Exception as e:
            logger.error(f"Satellite sync failed for field {field_id}: {e}", exc_info=True)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE ingestion_runs
                    SET completed_at = %s, status = 'FAILED', error_summary = %s
                    WHERE id = %s
                    """,
                    (datetime.now(timezone.utc), str(e), run_id)
                )
            return {"status": "FAILED", "error": str(e)}

    def get_data_freshness(self, conn: psycopg.Connection, field_id: str) -> Dict[str, Any]:
        """
        Inspects the latest timestamps across weather, soil, and satellite observations
        and reports staleness scores.
        """
        now = datetime.now(timezone.utc)
        freshness = {}

        with conn.cursor(row_factory=dict_row) as cur:
            # Weather
            cur.execute(
                """
                SELECT observed_at, provenance
                FROM weather_observations
                WHERE field_id = %s
                ORDER BY observed_at DESC LIMIT 1
                """,
                (field_id,)
            )
            w = cur.fetchone()
            if w and w["observed_at"]:
                hours = (now - w["observed_at"]).total_seconds() / 3600.0
                freshness["weather"] = {
                    "last_observed_at": w["observed_at"].isoformat(),
                    "hours_ago": round(hours, 1),
                    "is_stale": hours > 24.0,
                    "provenance": w["provenance"]
                }
            else:
                freshness["weather"] = {"last_observed_at": None, "is_stale": True, "reason": "No observations"}

            # Soil
            cur.execute(
                """
                SELECT observed_at, soil_texture_class, provenance
                FROM soil_observations
                WHERE field_id = %s
                ORDER BY observed_at DESC LIMIT 1
                """,
                (field_id,)
            )
            s = cur.fetchone()
            if s and s["observed_at"]:
                days = (now - s["observed_at"]).total_seconds() / 86400.0
                freshness["soil"] = {
                    "last_observed_at": s["observed_at"].isoformat(),
                    "days_ago": round(days, 1),
                    "is_stale": days > 90.0,
                    "soil_texture_class": s["soil_texture_class"],
                    "provenance": s["provenance"]
                }
            else:
                freshness["soil"] = {"last_observed_at": None, "is_stale": True, "reason": "No observations"}

            # Satellite
            cur.execute(
                """
                SELECT so.acquired_at, vi.mean_value as ndvi, so.provenance
                FROM satellite_observations so
                LEFT JOIN vegetation_indices vi ON vi.satellite_observation_id = so.id AND vi.index_code = 'NDVI'
                WHERE so.field_id = %s
                ORDER BY so.acquired_at DESC LIMIT 1
                """,
                (field_id,)
            )
            sat = cur.fetchone()
            if sat and sat["acquired_at"]:
                days = (now - sat["acquired_at"]).total_seconds() / 86400.0
                freshness["satellite"] = {
                    "last_acquired_at": sat["acquired_at"].isoformat(),
                    "days_ago": round(days, 1),
                    "is_stale": days > 14.0,
                    "latest_ndvi": float(sat["ndvi"]) if sat["ndvi"] is not None else None,
                    "provenance": sat["provenance"]
                }
            else:
                freshness["satellite"] = {"last_acquired_at": None, "is_stale": True, "reason": "No observations"}

        return {
            "field_id": field_id,
            "checked_at": now.isoformat(),
            "freshness": freshness
        }
