from uuid import UUID, uuid4
from typing import Optional, Dict, Any, List
import psycopg

class FarmRepository:
    @staticmethod
    def list_by_user(conn: psycopg.Connection, user_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT f.*,
                       COUNT(fld.id) AS fields_count
                FROM public.farms f
                LEFT JOIN public.fields fld ON f.id = fld.farm_id AND fld.is_active = true
                WHERE f.user_id = %s AND f.is_active = true
                GROUP BY f.id
                ORDER BY f.created_at DESC;
                """,
                (str(user_id),)
            )
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def get_by_id(conn: psycopg.Connection, farm_id: UUID, user_id: Optional[UUID] = None) -> Optional[Dict[str, Any]]:
        query = "SELECT * FROM public.farms WHERE id = %s AND is_active = true"
        params = [str(farm_id)]
        if user_id:
            query += " AND user_id = %s"
            params.append(str(user_id))
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            row = cur.fetchone()
            return dict(row) if row else None

    @staticmethod
    def create(
        conn: psycopg.Connection,
        user_id: UUID,
        name: str,
        description: Optional[str] = None,
        timezone: str = "Asia/Kolkata",
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        elevation_meters: Optional[float] = None,
        total_area_hectares: Optional[float] = None,
        primary_water_source: Optional[str] = None,
        grid_connection_type: Optional[str] = "3_PHASE_AGRICULTURAL"
    ) -> Dict[str, Any]:
        farm_id = uuid4()
        with conn.cursor() as cur:
            if longitude is not None and latitude is not None:
                cur.execute(
                    """
                    INSERT INTO public.farms (
                        id, user_id, name, description, timezone, latitude, longitude,
                        elevation_meters, total_area_hectares, primary_water_source,
                        grid_connection_type, location
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                    RETURNING *;
                    """,
                    (
                        str(farm_id), str(user_id), name, description, timezone,
                        latitude, longitude, elevation_meters, total_area_hectares,
                        primary_water_source, grid_connection_type, longitude, latitude
                    )
                )
            else:
                cur.execute(
                    """
                    INSERT INTO public.farms (
                        id, user_id, name, description, timezone, latitude, longitude,
                        elevation_meters, total_area_hectares, primary_water_source,
                        grid_connection_type
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *;
                    """,
                    (
                        str(farm_id), str(user_id), name, description, timezone,
                        latitude, longitude, elevation_meters, total_area_hectares,
                        primary_water_source, grid_connection_type
                    )
                )
            row = cur.fetchone()
            return dict(row)

    @staticmethod
    def update(
        conn: psycopg.Connection,
        farm_id: UUID,
        user_id: UUID,
        updates: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        allowed = [
            "name", "description", "latitude", "longitude", "elevation_meters",
            "total_area_hectares", "primary_water_source", "grid_connection_type"
        ]
        set_clauses = []
        values = []
        for k in allowed:
            if k in updates and updates[k] is not None:
                set_clauses.append(f"{k} = %s")
                values.append(updates[k])
        
        if not set_clauses:
            return FarmRepository.get_by_id(conn, farm_id, user_id)
        
        # If lat & lon updated, also update geometry
        if "latitude" in updates and "longitude" in updates and updates["latitude"] is not None and updates["longitude"] is not None:
            set_clauses.append("location = ST_SetSRID(ST_MakePoint(%s, %s), 4326)")
            values.extend([updates["longitude"], updates["latitude"]])

        values.extend([str(farm_id), str(user_id)])
        query = f"UPDATE public.farms SET {', '.join(set_clauses)} WHERE id = %s AND user_id = %s RETURNING *;"
        with conn.cursor() as cur:
            cur.execute(query, tuple(values))
            row = cur.fetchone()
            return dict(row) if row else None

    @staticmethod
    def delete(conn: psycopg.Connection, farm_id: UUID, user_id: UUID) -> bool:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE public.farms SET is_active = false WHERE id = %s AND user_id = %s RETURNING id;",
                (str(farm_id), str(user_id))
            )
            return cur.fetchone() is not None
