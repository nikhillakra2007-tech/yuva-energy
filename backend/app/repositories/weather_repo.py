from uuid import UUID
from typing import Optional, Dict, Any, List
import psycopg

class WeatherRepository:
    @staticmethod
    def get_latest_observation(conn: psycopg.Connection, field_id: UUID) -> Optional[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT wo.*, ws.name AS weather_source_name
                FROM public.weather_observations wo
                JOIN public.weather_sources ws ON wo.weather_source_id = ws.id
                WHERE wo.field_id = %s
                ORDER BY wo.observed_at DESC, wo.id DESC
                LIMIT 1;
                """,
                (str(field_id),)
            )
            row = cur.fetchone()
            return dict(row) if row else None

    @staticmethod
    def list_recent_observations(conn: psycopg.Connection, field_id: UUID, limit: int = 48) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT wo.*, ws.name AS weather_source_name
                FROM public.weather_observations wo
                JOIN public.weather_sources ws ON wo.weather_source_id = ws.id
                WHERE wo.field_id = %s
                ORDER BY wo.observed_at DESC
                LIMIT %s;
                """,
                (str(field_id), limit)
            )
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def get_latest_forecast(conn: psycopg.Connection, field_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT wf.*, wfr.forecast_run_at, wfr.provenance
                FROM public.weather_forecasts wf
                JOIN public.weather_forecast_runs wfr ON wf.forecast_run_id = wfr.id
                WHERE wf.field_id = %s
                ORDER BY wf.forecast_datetime ASC;
                """,
                (str(field_id),)
            )
            return [dict(row) for row in cur.fetchall()]
