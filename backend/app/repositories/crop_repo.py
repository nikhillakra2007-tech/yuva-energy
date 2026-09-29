from uuid import UUID, uuid4
from typing import Optional, Dict, Any, List
from datetime import date
import psycopg

class CropRepository:
    @staticmethod
    def list_crops(conn: psycopg.Connection) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM public.crops WHERE is_active = true ORDER BY name ASC;")
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def get_crop_by_id(conn: psycopg.Connection, crop_id: UUID) -> Optional[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM public.crops WHERE id = %s;", (str(crop_id),))
            row = cur.fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_growth_stages(conn: psycopg.Connection, crop_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT * FROM public.crop_growth_stages
                WHERE crop_id = %s
                ORDER BY stage_order ASC;
                """,
                (str(crop_id),)
            )
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def list_varieties(conn: psycopg.Connection, crop_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM public.crop_varieties WHERE crop_id = %s AND is_active = true;", (str(crop_id),))
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def list_cycles_by_field(conn: psycopg.Connection, field_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT cc.*,
                       c.name AS crop_name,
                       c.code AS crop_code,
                       cgs.stage_code AS current_growth_stage,
                       cgs.kc_coefficient AS current_kc
                FROM public.crop_cycles cc
                JOIN public.crops c ON cc.crop_id = c.id
                LEFT JOIN LATERAL (
                    SELECT growth_stage_id FROM public.crop_stage_observations
                    WHERE crop_cycle_id = cc.id
                    ORDER BY observed_at DESC LIMIT 1
                ) latest_stage ON true
                LEFT JOIN public.crop_growth_stages cgs ON latest_stage.growth_stage_id = cgs.id
                WHERE cc.field_id = %s
                ORDER BY cc.sowing_date DESC;
                """,
                (str(field_id),)
            )
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def create_cycle(
        conn: psycopg.Connection,
        field_id: UUID,
        crop_id: UUID,
        season: str,
        cycle_year: int,
        sowing_date: date,
        crop_variety_id: Optional[UUID] = None,
        expected_harvest_date: Optional[date] = None
    ) -> Dict[str, Any]:
        cycle_id = uuid4()
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.crop_cycles (
                    id, field_id, crop_id, crop_variety_id, season, cycle_year,
                    sowing_date, expected_harvest_date, status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'ACTIVE')
                RETURNING *;
                """,
                (
                    str(cycle_id), str(field_id), str(crop_id),
                    str(crop_variety_id) if crop_variety_id else None,
                    season, cycle_year, sowing_date, expected_harvest_date
                )
            )
            row = cur.fetchone()
            return dict(row)
