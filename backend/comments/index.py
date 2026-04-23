"""
Функция для работы с комментариями: получение и добавление комментариев к посту.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p9483625_cyberpunk_social_net"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    if method == "GET":
        return get_comments(params)

    if method == "POST":
        return add_comment(event)

    return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}


def get_comments(params):
    post_id = params.get("post_id")
    if not post_id:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "post_id required"})}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        SELECT
            c.id, c.text, c.created_at,
            u.id as user_id, u.name as user_name, u.handle as user_handle, u.avatar_url as user_avatar
        FROM {SCHEMA}.comments c
        JOIN {SCHEMA}.users u ON u.id = c.user_id
        WHERE c.post_id = %s
        ORDER BY c.created_at ASC
    """, (post_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    comments = []
    for r in rows:
        comments.append({
            "id": r["id"],
            "text": r["text"],
            "created_at": r["created_at"].isoformat(),
            "user": {
                "id": r["user_id"],
                "name": r["user_name"],
                "handle": r["user_handle"],
                "avatar_url": r["user_avatar"],
            }
        })

    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"comments": comments})}


def add_comment(event):
    body = json.loads(event.get("body") or "{}")
    post_id = body.get("post_id")
    user_id = body.get("user_id", 1)
    text = body.get("text", "").strip()

    if not post_id or not text:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "post_id and text required"})}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        INSERT INTO {SCHEMA}.comments (post_id, user_id, text)
        VALUES (%s, %s, %s)
        RETURNING id, text, created_at, user_id
    """, (post_id, user_id, text))
    comment = cur.fetchone()

    cur.execute(f"UPDATE {SCHEMA}.posts SET comments_count = comments_count + 1 WHERE id = %s", (post_id,))

    cur.execute(f"SELECT id, name, handle, avatar_url FROM {SCHEMA}.users WHERE id = %s", (user_id,))
    user = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 201,
        "headers": CORS_HEADERS,
        "body": json.dumps({
            "comment": {
                "id": comment["id"],
                "text": comment["text"],
                "created_at": comment["created_at"].isoformat(),
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "handle": user["handle"],
                    "avatar_url": user["avatar_url"],
                }
            }
        })
    }
