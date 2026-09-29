from uuid import UUID, uuid4
from typing import Optional, Dict, Any, List
import psycopg

class RecommendationRepository:
    @staticmethod
    def list_active_by_user(conn: psycopg.Connection, user_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.*,
                       r.recommended_volume_litres AS recommended_water_volume_litres,
                       f.name AS field_name,
                       fm.name AS farm_name
                FROM public.recommendations r
                JOIN public.fields f ON r.field_id = f.id
                JOIN public.farms fm ON f.farm_id = fm.id
                WHERE fm.user_id = %s AND r.status IN ('PENDING', 'VIEWED')
                ORDER BY r.created_at DESC;
                """,
                (str(user_id),)
            )
            recs = [dict(row) for row in cur.fetchall()]
            for r in recs:
                cur.execute(
                    """
                    SELECT * FROM public.recommendation_reasons
                    WHERE recommendation_id = %s
                    ORDER BY weight DESC NULLS LAST;
                    """,
                    (str(r["id"]),)
                )
                r["reasons"] = [dict(reason) for reason in cur.fetchall()]
                r["drivers"] = [reason["description_vernacular"] for reason in r["reasons"]]
                r["limitations"] = ["Derived from meteorological & satellite telemetry; local soil validation advised."]
            return recs

    @staticmethod
    def get_by_id(conn: psycopg.Connection, rec_id: UUID) -> Optional[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.*,
                       r.recommended_volume_litres AS recommended_water_volume_litres,
                       f.name AS field_name,
                       fm.user_id,
                       fm.name AS farm_name
                FROM public.recommendations r
                JOIN public.fields f ON r.field_id = f.id
                JOIN public.farms fm ON f.farm_id = fm.id
                WHERE r.id = %s;
                """,
                (str(rec_id),)
            )
            row = cur.fetchone()
            if not row:
                return None
            res = dict(row)
            cur.execute(
                "SELECT * FROM public.recommendation_reasons WHERE recommendation_id = %s ORDER BY weight DESC NULLS LAST;",
                (str(rec_id),)
            )
            res["reasons"] = [dict(reason) for reason in cur.fetchall()]
            res["drivers"] = [reason["description_vernacular"] for reason in res["reasons"]]
            res["limitations"] = ["Derived from meteorological & satellite telemetry; local soil validation advised."]
            return res

    @staticmethod
    def add_feedback(
        conn: psycopg.Connection,
        recommendation_id: UUID,
        user_id: UUID,
        action_taken: str,
        actual_water_volume_litres: Optional[float] = None,
        farmer_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        feedback_id = uuid4()
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.recommendation_feedback (
                    id, recommendation_id, user_id, action_taken,
                    actual_water_volume_litres, farmer_notes
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (str(feedback_id), str(recommendation_id), str(user_id), action_taken, actual_water_volume_litres, farmer_notes)
            )
            row = cur.fetchone()
            return dict(row)
