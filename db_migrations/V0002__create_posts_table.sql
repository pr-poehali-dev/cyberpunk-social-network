CREATE TABLE IF NOT EXISTS t_p9483625_cyberpunk_social_net.posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p9483625_cyberpunk_social_net.users(id),
    content TEXT NOT NULL,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    reposts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);