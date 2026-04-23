"""
Профиль пользователя: GET получение, PUT обновление имени/bio, POST загрузка аватара.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p9483625_cyberpunk_social_net"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def user_dict(u):
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


def ok(data, status=200):
    return {"statusCode": status, "headers": CORS_HEADERS, "body": json.dumps(data)}


def err(msg, status=400):
    return {"statusCode": status, "headers": CORS_HEADERS, "body": json.dumps({"error": msg})}


def get_user_by_token(cur, token):
    if not token:
        return None
    cur.execute(f"SELECT * FROM {SCHEMA}.users WHERE session_token = %s", (token,))
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    if method == "GET":
        return get_profile(event)
    if method == "PUT":
        return update_profile(event)
    if method == "POST" and path.endswith("/avatar"):
        return upload_avatar(event)

    return err("Not found", 404)


def get_profile(event):
    params = event.get("queryStringParameters") or {}
    user_id = params.get("user_id", "1")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT * FROM {SCHEMA}.users WHERE id = %s", (user_id,))
    user = cur.fetchone()

    if not user:
        cur.close(); conn.close()
        return err("User not found", 404)

    cur.execute(f"""
        SELECT id, content, image_url, tags, likes_count, comments_count, reposts_count, created_at
        FROM {SCHEMA}.posts WHERE user_id = %s ORDER BY created_at DESC LIMIT 20
    """, (user_id,))
    posts = cur.fetchall()
    cur.close(); conn.close()

    return ok({
        "user": user_dict(user),
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


def update_profile(event):
    token = (event.get("headers") or {}).get("X-Session-Token")
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    user = get_user_by_token(cur, token)
    if not user:
        cur.close(); conn.close()
        return err("Не авторизован", 401)

    name = (body.get("name") or "").strip() or user["name"]
    bio = body.get("bio", user["bio"])

    if len(name) < 2:
        cur.close(); conn.close()
        return err("Имя слишком короткое")

    cur.execute(
        f"UPDATE {SCHEMA}.users SET name = %s, bio = %s WHERE id = %s RETURNING *",
        (name, bio, user["id"])
    )
    updated = cur.fetchone()
    conn.commit()
    cur.close(); conn.close()

    return ok({"user": user_dict(updated)})


def upload_avatar(event):
    token = (event.get("headers") or {}).get("X-Session-Token")
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    user = get_user_by_token(cur, token)
    if not user:
        cur.close(); conn.close()
        return err("Не авторизован", 401)

    image_b64 = body.get("image")
    content_type = body.get("content_type", "image/jpeg")

    if not image_b64:
        cur.close(); conn.close()
        return err("Нет изображения")

    # decode & upload to S3
    image_data = base64.b64decode(image_b64)
    ext = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
    key = f"avatars/{user['id']}_{uuid.uuid4().hex[:8]}.{ext}"

    s3 = get_s3()
    s3.put_object(
        Bucket="files",
        Key=key,
        Body=image_data,
        ContentType=content_type,
    )

    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    avatar_url = f"https://cdn.poehali.dev/projects/{access_key}/files/{key}"

    cur.execute(
        f"UPDATE {SCHEMA}.users SET avatar_url = %s WHERE id = %s RETURNING *",
        (avatar_url, user["id"])
    )
    updated = cur.fetchone()
    conn.commit()
    cur.close(); conn.close()

    return ok({"user": user_dict(updated), "avatar_url": avatar_url})
