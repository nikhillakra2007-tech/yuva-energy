import json
from uuid import UUID, uuid4
from typing import Optional, Dict, Any
import psycopg

class UserRepository:
    @staticmethod
    def get_by_email(conn: psycopg.Connection, email: str) -> Optional[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM public.users WHERE email = %s;", (email.lower().strip(),))
            row = cur.fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_by_id(conn: psycopg.Connection, user_id: UUID) -> Optional[Dict[str, Any]]:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM public.users WHERE id = %s;", (str(user_id),))
            row = cur.fetchone()
            return dict(row) if row else None

    @staticmethod
    def create_user(
        conn: psycopg.Connection,
        full_name: str,
        email: str,
        hashed_password: str,
        phone_number: Optional[str] = None,
        preferred_language: str = "en"
    ) -> Dict[str, Any]:
        user_id = uuid4()
        auth_id = uuid4()
        metadata = json.dumps({"password_hash": hashed_password})
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.users (id, auth_id, full_name, email, phone_number, preferred_language, metadata)
                VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)
                RETURNING *;
                """,
                (str(user_id), str(auth_id), full_name, email.lower().strip(), phone_number, preferred_language, metadata)
            )
            row = cur.fetchone()
            return dict(row)

    @staticmethod
    def update_profile(
        conn: psycopg.Connection,
        user_id: UUID,
        full_name: Optional[str] = None,
        phone_number: Optional[str] = None,
        preferred_language: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        fields = []
        values = []
        if full_name is not None:
            fields.append("full_name = %s")
            values.append(full_name)
        if phone_number is not None:
            fields.append("phone_number = %s")
            values.append(phone_number)
        if preferred_language is not None:
            fields.append("preferred_language = %s")
            values.append(preferred_language)
        
        if not fields:
            return UserRepository.get_by_id(conn, user_id)
        
        values.append(str(user_id))
        query = f"UPDATE public.users SET {', '.join(fields)} WHERE id = %s RETURNING *;"
        with conn.cursor() as cur:
            cur.execute(query, tuple(values))
            row = cur.fetchone()
            return dict(row) if row else None
