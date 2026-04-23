"""
Функция для работы с постами: получение ленты, создание поста, лайк/анлайк.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p9483625_cyberpunk_social_net"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    if method == "GET" and path == "/":
        return get_posts(event)

    if method == "POST" and path == "/":
        return create_post(event)

    if method == "POST" and path.endswith("/like"):
        post_id = path.split("/")[-2]
        return toggle_like(event, post_id)

    return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}


def get_posts(event):
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    user_id = (event.get("queryStringParameters") or {}).get("user_id")

    cur.execute(f"""
        SELECT
            p.id, p.content, p.image_url, p.tags,
            p.likes_count, p.comments_count, p.reposts_count,
            p.created_at,
            u.id as user_id, u.name as user_name, u.handle as user_handle,
            u.avatar_url as user_avatar, u.status as user_status,
            CASE WHEN l.id IS NOT NULL THEN true ELSE false END as liked
        FROM {SCHEMA}.posts p
        JOIN {SCHEMA}.users u ON u.id = p.user_id
        LEFT JOIN {SCHEMA}.likes l ON l.post_id = p.id AND l.user_id = %s
        ORDER BY p.created_at DESC
        LIMIT 50
    """, (user_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    posts = []
    for r in rows:
        posts.append({
            "id": r["id"],
            "content": r["content"],
            "image_url": r["image_url"],
            "tags": r["tags"] or [],
            "likes_count": r["likes_count"],
            "comments_count": r["comments_count"],
            "reposts_count": r["reposts_count"],
            "created_at": r["created_at"].isoformat(),
            "liked": r["liked"],
            "user": {
                "id": r["user_id"],
                "name": r["user_name"],
                "handle": r["user_handle"],
                "avatar_url": r["user_avatar"],
                "status": r["user_status"],
            }
        })

    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"posts": posts})}


def create_post(event):
    body = json.loads(event.get("body") or "{}")
    content = body.get("content", "").strip()
    user_id = body.get("user_id", 1)
    tags = body.get("tags", [])
    image_url = body.get("image_url")

    if not content:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "content required"})}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        INSERT INTO {SCHEMA}.posts (user_id, content, image_url, tags)
        VALUES (%s, %s, %s, %s)
        RETURNING id, content, image_url, tags, likes_count, comments_count, reposts_count, created_at, user_id
    """, (user_id, content, image_url, tags))

    post = cur.fetchone()

    cur.execute(f"SELECT id, name, handle, avatar_url, status FROM {SCHEMA}.users WHERE id = %s", (user_id,))
    user = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 201,
        "headers": CORS_HEADERS,
        "body": json.dumps({
            "post": {
                "id": post["id"],
                "content": post["content"],
                "image_url": post["image_url"],
                "tags": post["tags"] or [],
                "likes_count": 0,
                "comments_count": 0,
                "reposts_count": 0,
                "created_at": post["created_at"].isoformat(),
                "liked": False,
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "handle": user["handle"],
                    "avatar_url": user["avatar_url"],
                    "status": user["status"],
                }
            }
        })
    }


def toggle_like(event, post_id):
    body = json.loads(event.get("body") or "{}")
    user_id = body.get("user_id", 1)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"SELECT id FROM {SCHEMA}.likes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
    existing = cur.fetchone()

    if existing:
        cur.execute(f"DELETE FROM {SCHEMA}.likes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
        cur.execute(f"UPDATE {SCHEMA}.posts SET likes_count = likes_count - 1 WHERE id = %s RETURNING likes_count", (post_id,))
        liked = False
    else:
        cur.execute(f"INSERT INTO {SCHEMA}.likes (post_id, user_id) VALUES (%s, %s)", (post_id, user_id))
        cur.execute(f"UPDATE {SCHEMA}.posts SET likes_count = likes_count + 1 WHERE id = %s RETURNING likes_count", (post_id,))
        liked = True

    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"liked": liked, "likes_count": row["likes_count"]})
    }
