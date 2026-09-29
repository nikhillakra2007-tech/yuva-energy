import json
from uuid import UUID, uuid4
from typing import Optional, Dict, Any, List
import psycopg

class FieldRepository:
    @staticmethod
    def list_by_farm(conn: psycopg.Connection, farm_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT f.id, f.farm_id, f.name, f.area_hectares, f.perimeter_meters,
                       f.metadata->>'soil_type' AS soil_type,
                       f.slope_percentage, f.is_active, f.created_at, f.updated_at,
                       ST_AsGeoJSON(f.boundary)::jsonb AS boundary_geojson,
                       ST_AsGeoJSON(f.centroid)::jsonb AS centroid_geojson,
                       c.name AS current_crop_name,
                       cgs.stage_code AS current_crop_stage,
                       fs.current_ndvi
                FROM public.fields f
                LEFT JOIN public.crop_cycles cc ON f.id = cc.field_id AND cc.status = 'ACTIVE'
                LEFT JOIN public.crops c ON cc.crop_id = c.id
                LEFT JOIN LATERAL (
                    SELECT growth_stage_id FROM public.crop_stage_observations
                    WHERE crop_cycle_id = cc.id
                    ORDER BY observed_at DESC LIMIT 1
                ) latest_stage ON true
                LEFT JOIN public.crop_growth_stages cgs ON latest_stage.growth_stage_id = cgs.id
                LEFT JOIN LATERAL (
                    SELECT current_ndvi FROM public.farm_states
                    WHERE field_id = f.id
                    ORDER BY evaluated_at DESC LIMIT 1
                ) fs ON true
                WHERE f.farm_id = %s AND f.is_active = true
                ORDER BY f.created_at DESC;
                """,
                (str(farm_id),)
            )
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def list_all_user_fields(conn: psycopg.Connection, user_id: UUID) -> List[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT f.id, f.farm_id, f.name, f.area_hectares, f.perimeter_meters,
                       f.metadata->>'soil_type' AS soil_type,
                       f.slope_percentage, f.is_active, f.created_at, f.updated_at,
                       ST_AsGeoJSON(f.boundary)::jsonb AS boundary_geojson,
                       ST_AsGeoJSON(f.centroid)::jsonb AS centroid_geojson,
                       fm.name AS farm_name,
                       c.name AS current_crop_name,
                       cgs.stage_code AS current_crop_stage,
                       fs.current_ndvi
                FROM public.fields f
                JOIN public.farms fm ON f.farm_id = fm.id
                LEFT JOIN public.crop_cycles cc ON f.id = cc.field_id AND cc.status = 'ACTIVE'
                LEFT JOIN public.crops c ON cc.crop_id = c.id
                LEFT JOIN LATERAL (
                    SELECT growth_stage_id FROM public.crop_stage_observations
                    WHERE crop_cycle_id = cc.id
                    ORDER BY observed_at DESC LIMIT 1
                ) latest_stage ON true
                LEFT JOIN public.crop_growth_stages cgs ON latest_stage.growth_stage_id = cgs.id
                LEFT JOIN LATERAL (
                    SELECT current_ndvi FROM public.farm_states
                    WHERE field_id = f.id
                    ORDER BY evaluated_at DESC LIMIT 1
                ) fs ON true
                WHERE fm.user_id = %s AND f.is_active = true
                ORDER BY f.created_at DESC;
                """,
                (str(user_id),)
            )
            return [dict(row) for row in cur.fetchall()]

    @staticmethod
    def get_by_id(conn: psycopg.Connection, field_id: UUID) -> Optional[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT f.id, f.farm_id, f.name, f.area_hectares, f.perimeter_meters,
                       f.metadata->>'soil_type' AS soil_type,
                       f.slope_percentage, f.is_active, f.created_at, f.updated_at,
                       ST_AsGeoJSON(f.boundary)::jsonb AS boundary_geojson,
                       ST_AsGeoJSON(f.centroid)::jsonb AS centroid_geojson,
                       fm.user_id,
                       fm.name AS farm_name
                FROM public.fields f
                JOIN public.farms fm ON f.farm_id = fm.id
                WHERE f.id = %s AND f.is_active = true;
                """,
                (str(field_id),)
            )
            row = cur.fetchone()
            return dict(row) if row else None

    @staticmethod
    def create(
        conn: psycopg.Connection,
        farm_id: UUID,
        name: str,
        boundary_geojson: Dict[str, Any],
        soil_type: Optional[str] = None,
        slope_percentage: Optional[float] = None
    ) -> Dict[str, Any]:
        field_id = uuid4()
        geojson_str = json.dumps(boundary_geojson)
        metadata = json.dumps({"soil_type": soil_type} if soil_type else {})
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.fields (
                    id, farm_id, name, boundary, slope_percentage, metadata
                )
                VALUES (
                    %s, %s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), %s, %s::jsonb
                )
                RETURNING id, farm_id, name, area_hectares, perimeter_meters,
                          metadata->>'soil_type' AS soil_type,
                          slope_percentage, is_active, created_at, updated_at,
                          ST_AsGeoJSON(boundary)::jsonb AS boundary_geojson,
                          ST_AsGeoJSON(centroid)::jsonb AS centroid_geojson;
                """,
                (str(field_id), str(farm_id), name, geojson_str, slope_percentage, metadata)
            )
            row = cur.fetchone()
            return dict(row)

    @staticmethod
    def update(
        conn: psycopg.Connection,
        field_id: UUID,
        updates: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        set_clauses = []
        values = []
        if "name" in updates and updates["name"] is not None:
            set_clauses.append("name = %s")
            values.append(updates["name"])
        if "soil_type" in updates and updates["soil_type"] is not None:
            set_clauses.append("metadata = metadata || %s::jsonb")
            values.append(json.dumps({"soil_type": updates["soil_type"]}))
        if "slope_percentage" in updates and updates["slope_percentage"] is not None:
            set_clauses.append("slope_percentage = %s")
            values.append(updates["slope_percentage"])
        if "boundary" in updates and updates["boundary"] is not None:
            set_clauses.append("boundary = ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)")
            values.append(json.dumps(updates["boundary"]))

        if not set_clauses:
            return FieldRepository.get_by_id(conn, field_id)

        values.append(str(field_id))
        query = f"""
            UPDATE public.fields
            SET {', '.join(set_clauses)}
            WHERE id = %s
            RETURNING id, farm_id, name, area_hectares, perimeter_meters,
                      metadata->>'soil_type' AS soil_type,
                      slope_percentage, is_active, created_at, updated_at,
                      ST_AsGeoJSON(boundary)::jsonb AS boundary_geojson,
                      ST_AsGeoJSON(centroid)::jsonb AS centroid_geojson;
        """
        with conn.cursor() as cur:
            cur.execute(query, tuple(values))
            row = cur.fetchone()
            return dict(row) if row else None

    @staticmethod
    def delete(conn: psycopg.Connection, field_id: UUID) -> bool:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE public.fields SET is_active = false WHERE id = %s RETURNING id;",
                (str(field_id),)
            )
            return cur.fetchone() is not None

    @staticmethod
    def create_zone(
        conn: psycopg.Connection,
        field_id: UUID,
        name: str,
        boundary_geojson: Optional[Dict[str, Any]] = None,
        soil_texture: Optional[str] = None
    ) -> Dict[str, Any]:
        zone_id = uuid4()
        metadata = json.dumps({"soil_texture": soil_texture} if soil_texture else {})
        with conn.cursor() as cur:
            if boundary_geojson:
                cur.execute(
                    """
                    INSERT INTO public.field_zones (id, field_id, name, boundary, metadata)
                    VALUES (%s, %s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), %s::jsonb)
                    RETURNING id, field_id, name, area_hectares, metadata->>'soil_texture' AS soil_texture, is_active, created_at,
                              ST_AsGeoJSON(boundary)::jsonb AS boundary_geojson;
                    """,
                    (str(zone_id), str(field_id), name, json.dumps(boundary_geojson), metadata)
                )
            else:
                cur.execute(
                    """
                    INSERT INTO public.field_zones (id, field_id, name, metadata)
                    VALUES (%s, %s, %s, %s::jsonb)
                    RETURNING id, field_id, name, area_hectares, metadata->>'soil_texture' AS soil_texture, is_active, created_at;
                    """,
                    (str(zone_id), str(field_id), name, metadata)
                )
            row = cur.fetchone()
            return dict(row)
