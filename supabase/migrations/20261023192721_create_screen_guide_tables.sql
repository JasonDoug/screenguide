/*
# ScreenGuide: Sessions and Messages Tables

## Overview
Creates two tables to support a desktop streaming + LLM troubleshooting app.
Users share their screen, frames are captured, and the user can ask questions
or request tutorials. The LLM analyzes the screen frames and provides guidance.

## New Tables

### sessions
- `id` (uuid, primary key)
- `title` (text, not null) — user-provided session name
- `mode` (text, not null, default 'troubleshoot') — 'troubleshoot' or 'tutorial'
- `status` (text, not null, default 'active') — 'active' or 'ended'
- `created_at` (timestamptz, default now)

### messages
- `id` (uuid, primary key)
- `session_id` (uuid, foreign key to sessions, cascade delete)
- `role` (text, not null) — 'user' or 'assistant'
- `content` (text, not null) — message text
- `image_data` (text, nullable) — base64-encoded screenshot attached to user messages
- `created_at` (timestamptz, default now())

## Security
- Single-tenant app (no sign-in required), so policies use `TO anon, authenticated`
- RLS enabled on both tables
- CRUD grants to anon + authenticated
- Foreign key with cascade delete so ending a session removes its messages
- Index on messages.session_id for query performance
*/

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  mode text NOT NULL DEFAULT 'troubleshoot' CHECK (mode IN ('troubleshoot', 'tutorial')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  image_data text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);
