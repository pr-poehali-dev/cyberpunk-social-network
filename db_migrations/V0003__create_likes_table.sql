CREATE TABLE IF NOT EXISTS t_p9483625_cyberpunk_social_net.likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES t_p9483625_cyberpunk_social_net.posts(id),
    user_id INTEGER REFERENCES t_p9483625_cyberpunk_social_net.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);