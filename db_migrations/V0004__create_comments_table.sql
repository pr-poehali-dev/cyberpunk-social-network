CREATE TABLE IF NOT EXISTS t_p9483625_cyberpunk_social_net.comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES t_p9483625_cyberpunk_social_net.posts(id),
    user_id INTEGER REFERENCES t_p9483625_cyberpunk_social_net.users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);