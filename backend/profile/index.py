"""
Функция для получения профиля пользователя и его постов.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p9483625_cyberpunk_social_net"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    params = event.get("queryStringParameters") or {}
    user_id = params.get("user_id", "1")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"SELECT * FROM {SCHEMA}.users WHERE id = %s", (user_id,))
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "User not found"})}

    cur.execute(f"""
        SELECT id, content, image_url, tags, likes_count, comments_count, reposts_count, created_at
        FROM {SCHEMA}.posts WHERE user_id = %s ORDER BY created_at DESC LIMIT 20
    """, (user_id,))
    posts = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({
            "user": {
                "id": user["id"],
                "name": user["name"],
                "handle": user["handle"],
                "avatar_url": user["avatar_url"],
                "bio": user["bio"],
                "status": user["status"],
                "posts_count": user["posts_count"],
                "followers_count": user["followers_count"],
                "following_count": user["following_count"],
                "rating": float(user["rating"]),
                "tags": user["tags"] or [],
            },
            "posts": [
                {
                    "id": p["id"],
                    "content": p["content"],
                    "image_url": p["image_url"],
                    "tags": p["tags"] or [],
                    "likes_count": p["likes_count"],
                    "comments_count": p["comments_count"],
                    "reposts_count": p["reposts_count"],
                    "created_at": p["created_at"].isoformat(),
                }
                for p in posts
            ]
        })
    }
