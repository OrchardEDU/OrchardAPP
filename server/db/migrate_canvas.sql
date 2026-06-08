-- Migration: Canvas OAuth integration tables
-- Run against an existing Orchard database:
--   psql -U <user> -d <database> -f server/db/migrate_canvas.sql
--
-- Seed the default institution from your .env after running this migration:
-- INSERT INTO canvas_institutions (name, base_url, client_id, client_secret, redirect_uri)
-- VALUES (
--     'Local Canvas',
--     'http://localhost:3000',
--     'your_developer_key_id',
--     'your_developer_key_secret',
--     'http://localhost:8086/api/canvas/oauth/callback'
-- );
-- (Or let the app upsert from env on first OAuth start.)

CREATE TABLE IF NOT EXISTS canvas_institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(512) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(512) NOT NULL,
    redirect_uri VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_canvas_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES canvas_institutions(id) ON DELETE CASCADE,
    canvas_user_id BIGINT,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP NOT NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, institution_id)
);

CREATE TABLE IF NOT EXISTS course_canvas_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
    canvas_course_id BIGINT NOT NULL,
    canvas_course_name VARCHAR(255) NOT NULL,
    canvas_course_url VARCHAR(512) NOT NULL,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teacher_canvas_connections_teacher_id ON teacher_canvas_connections(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_canvas_connections_institution_id ON teacher_canvas_connections(institution_id);
CREATE INDEX IF NOT EXISTS idx_course_canvas_links_course_id ON course_canvas_links(course_id);

-- Triggers for updated_at (function must already exist from base schema)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_canvas_institutions_updated_at'
    ) THEN
        CREATE TRIGGER update_canvas_institutions_updated_at BEFORE UPDATE ON canvas_institutions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_teacher_canvas_connections_updated_at'
    ) THEN
        CREATE TRIGGER update_teacher_canvas_connections_updated_at BEFORE UPDATE ON teacher_canvas_connections
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_course_canvas_links_updated_at'
    ) THEN
        CREATE TRIGGER update_course_canvas_links_updated_at BEFORE UPDATE ON course_canvas_links
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
