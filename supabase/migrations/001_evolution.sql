-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 001 — Evolução da plataforma financeira
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. CONTAS FINANCEIRAS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('carteira','corrente','poupanca','digital','investimentos')),
  initial_balance DECIMAL(14,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(14,2) NOT NULL DEFAULT 0,
  color           TEXT NOT NULL DEFAULT '#3b82f6',
  icon            TEXT NOT NULL DEFAULT 'wallet',
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_select" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts_insert" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts_update" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounts_delete" ON accounts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- ─── 2. ADICIONAR account_id e notes À TABELA transactions ─────────────────
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS account_id  UUID REFERENCES accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes       TEXT,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);

-- ─── 3. METAS FINANCEIRAS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id     UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  target_amount  DECIMAL(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  target_date    DATE,
  color          TEXT NOT NULL DEFAULT '#22c55e',
  icon           TEXT NOT NULL DEFAULT 'target',
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_select" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals_insert" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete" ON goals FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- ─── 4. ORÇAMENTOS MENSAIS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  month       INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        INTEGER NOT NULL,
  amount      DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category, month, year)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_select" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "budgets_insert" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budgets_update" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "budgets_delete" ON budgets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id_period ON budgets(user_id, year, month);

-- ─── 5. TRANSAÇÕES RECORRENTES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id      UUID REFERENCES accounts(id) ON DELETE SET NULL,
  description     TEXT NOT NULL,
  amount          DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  type            TEXT NOT NULL CHECK (type IN ('receita','despesa')),
  category        TEXT NOT NULL,
  frequency       TEXT NOT NULL CHECK (frequency IN ('semanal','quinzenal','mensal','anual')),
  start_date      DATE NOT NULL,
  end_date        DATE,
  next_due_date   DATE NOT NULL,
  last_generated  DATE,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recurring_select" ON recurring_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recurring_insert" ON recurring_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recurring_update" ON recurring_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recurring_delete" ON recurring_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_due ON recurring_transactions(next_due_date) WHERE active = true;

-- ─── 6. OPEN FINANCE — Estrutura preparatória ────────────────────────────────
CREATE TABLE IF NOT EXISTS of_providers (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  active BOOLEAN DEFAULT true
);

INSERT INTO of_providers (id, name) VALUES
  ('pluggy', 'Pluggy'),
  ('belvo',  'Belvo'),
  ('klavi',  'Klavi')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS of_connections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id  TEXT NOT NULL REFERENCES of_providers(id),
  external_id  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','error','pending')),
  last_sync    TIMESTAMPTZ,
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, provider_id, external_id)
);

ALTER TABLE of_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "of_connections_select" ON of_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "of_connections_insert" ON of_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "of_connections_update" ON of_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "of_connections_delete" ON of_connections FOR DELETE USING (auth.uid() = user_id);

-- ─── 7. IA — Conversas e mensagens ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_conv_select" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_conv_insert" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_conv_delete" ON ai_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_msg_select" ON ai_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );
CREATE POLICY "ai_msg_insert" ON ai_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_id ON ai_messages(conversation_id);

-- ─── 8. FUNÇÃO: recalcular saldo da conta após transação ─────────────────────
CREATE OR REPLACE FUNCTION recalculate_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_account_id UUID;
BEGIN
  v_account_id := COALESCE(NEW.account_id, OLD.account_id);
  IF v_account_id IS NOT NULL THEN
    UPDATE accounts
    SET current_balance = initial_balance + (
      SELECT COALESCE(
        SUM(CASE WHEN type = 'receita' THEN amount ELSE -amount END), 0
      )
      FROM transactions
      WHERE account_id = v_account_id
    )
    WHERE id = v_account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_balance ON transactions;
CREATE TRIGGER trg_recalculate_balance
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION recalculate_account_balance();
