-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 002 — Open Finance Fase 0
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── of_accounts ─────────────────────────────────────────────────────────────
-- user_id direto: consistente com todas as outras tabelas do projeto;
-- simplifica RLS e elimina JOIN em queries do hook.
CREATE TABLE IF NOT EXISTS of_accounts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID        NOT NULL REFERENCES of_connections(id) ON DELETE CASCADE,
  account_id    UUID        REFERENCES accounts(id) ON DELETE SET NULL,
  external_id   TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  type          TEXT        NOT NULL,
  institution   TEXT        NOT NULL,
  currency      TEXT        NOT NULL DEFAULT 'BRL',
  last_balance  DECIMAL(14,2),
  last_sync     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (connection_id, external_id)
);

ALTER TABLE of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "of_accounts_select" ON of_accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "of_accounts_insert" ON of_accounts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "of_accounts_update" ON of_accounts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "of_accounts_delete" ON of_accounts FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_of_accounts_user_id    ON of_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_of_accounts_connection ON of_accounts(connection_id);
CREATE INDEX IF NOT EXISTS idx_of_accounts_account    ON of_accounts(account_id) WHERE account_id IS NOT NULL;
