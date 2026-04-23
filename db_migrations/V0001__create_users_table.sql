CREATE TABLE IF NOT EXISTS t_p9483625_cyberpunk_social_net.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    handle VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    status VARCHAR(20) DEFAULT 'online',
    posts_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    rating NUMERIC(4,1) DEFAULT 0.0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);