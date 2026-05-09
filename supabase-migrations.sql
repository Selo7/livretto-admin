-- Execute no SQL Editor do Supabase (projeto do Livretto)

CREATE TABLE IF NOT EXISTS admin_users (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username     TEXT UNIQUE NOT NULL,
  password_hash TEXT,                          -- NULL = primeiro acesso
  created_by   TEXT NOT NULL DEFAULT 'system',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Primeiro admin (você define a senha no primeiro login)
INSERT INTO admin_users (username, created_by)
VALUES ('brunomassa', 'system')
ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS admin_docs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT NOT NULL DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS admin_crm (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  status     TEXT NOT NULL DEFAULT 'lead'
               CHECK (status IN ('lead', 'trial', 'paying', 'churned')),
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desativa RLS nas tabelas admin (acesso via service_role key apenas)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_docs  DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_crm   DISABLE ROW LEVEL SECURITY;
