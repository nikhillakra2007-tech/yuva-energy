from uuid import UUID
from typing import Optional, Dict, Any, List
import psycopg

class SatelliteRepository:
    @staticmethod
    def get_latest_indices(conn: psycopg.Connection, field_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT vi.*, sc.collection_code AS satellite_product, so.cloud_cover_field_percentage
                FROM public.vegetation_indices vi
                JOIN public.satellite_observations so ON vi.satellite_observation_id = so.id
                JOIN public.satellite_scenes ss ON so.scene_id = ss.id
                JOIN public.satellite_collections sc ON ss.collection_id = sc.id
                WHERE vi.field_id = %s AND so.data_quality_status = 'VALID'
                ORDER BY vi.acquired_at DESC
                LIMIT 20;
                """,
                (str(field_id),)
            )
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def get_latest_observations(conn: psycopg.Connection, field_id: UUID, limit: int = 10) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT * FROM public.satellite_observations
                WHERE field_id = %s
                ORDER BY acquired_at DESC
                LIMIT %s;
                """,
                (str(field_id), limit)
            )
            return [dict(row) for row in cur.fetchall()]
