"""
Авторизация и регистрация пользователей. POST /register, POST /login, GET /me, POST /logout.
"""
import json
import os
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p9483625_cyberpunk_social_net"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

DEFAULT_AVATAR = "https://cdn.poehali.dev/projects/e3101b69-ea70-472c-90da-0df04c7ea68d/files/968dcd57-0329-4e54-8130-bca43699052e.jpg"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_token() -> str:
    return secrets.token_hex(32)


def user_to_dict(u: dict) -> dict:
    return {
        "id": u["id"],
        "name": u["name"],
        "handle": u["handle"],
        "avatar_url": u["avatar_url"],
        "bio": u["bio"],
        "status": u["status"],
        "posts_count": u["posts_count"],
        "followers_count": u["followers_count"],
        "following_count": u["following_count"],
        "rating": float(u["rating"]) if u["rating"] else 0.0,
        "tags": u["tags"] or [],
    }


def ok(data: dict, status: int = 200) -> dict:
    return {"statusCode": status, "headers": CORS_HEADERS, "body": json.dumps(data)}


def err(msg: str, status: int = 400) -> dict:
    return {"statusCode": status, "headers": CORS_HEADERS, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    # routing by path suffix
    if method == "POST":
        if path.endswith("/register"):
            return register(event)
        if path.endswith("/login"):
            return login(event)
        if path.endswith("/logout"):
            return logout(event)
        # fallback: routing by action field in body
        try:
            body = json.loads(event.get("body") or "{}")
            action = body.get("action")
            if action == "register":
                return register(event)
            if action == "login":
                return login(event)
            if action == "logout":
                return logout(event)
        except Exception:
            pass

    if method == "GET":
        if path.endswith("/me"):
            return me(event)
        return me(event)

    return err("Not found", 404)


def register(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    name = (body.get("name") or "").strip()
    handle = (body.get("handle") or "").strip().lstrip("@")
    password = body.get("password") or ""

    if not name or not handle or not password:
        return err("Все поля обязательны")
    if len(password) < 6:
        return err("Пароль минимум 6 символов")
    if len(handle) < 3:
        return err("Никнейм минимум 3 символа")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE handle = %s", (f"@{handle}",))
    if cur.fetchone():
        cur.close()
        conn.close()
        return err("Этот никнейм уже занят")

    token = make_token()
    pwd_hash = hash_password(password)

    cur.execute(f"""
        INSERT INTO {SCHEMA}.users
          (name, handle, avatar_url, bio, status, password_hash, session_token)
        VALUES (%s, %s, %s, %s, 'online', %s, %s)
        RETURNING *
    """, (name, f"@{handle}", DEFAULT_AVATAR, f"Новый пользователь NEXUS. #{handle}", pwd_hash, token))

    user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return ok({"token": token, "user": user_to_dict(user)}, 201)


def login(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    handle = (body.get("handle") or "").strip().lstrip("@")
    password = body.get("password") or ""

    if not handle or not password:
        return err("Введите никнейм и пароль")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"SELECT * FROM {SCHEMA}.users WHERE handle = %s", (f"@{handle}",))
    user = cur.fetchone()

    if not user or user["password_hash"] != hash_password(password):
        cur.close()
        conn.close()
        return err("Неверный никнейм или пароль", 401)

    token = make_token()
    cur.execute(f"UPDATE {SCHEMA}.users SET session_token = %s WHERE id = %s", (token, user["id"]))
    conn.commit()
    cur.close()
    conn.close()

    return ok({"token": token, "user": user_to_dict(user)})


def me(event: dict) -> dict:
    token = (event.get("headers") or {}).get("X-Session-Token") or \
            (event.get("queryStringParameters") or {}).get("token")

    if not token:
        return err("Не авторизован", 401)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT * FROM {SCHEMA}.users WHERE session_token = %s", (token,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        return err("Сессия недействительна", 401)

    return ok({"user": user_to_dict(user)})


def logout(event: dict) -> dict:
    token = (event.get("headers") or {}).get("X-Session-Token") or \
            (event.get("queryStringParameters") or {}).get("token")

    if token:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.users SET session_token = NULL WHERE session_token = %s", (token,))
        conn.commit()
        cur.close()
        conn.close()

    return ok({"ok": True})