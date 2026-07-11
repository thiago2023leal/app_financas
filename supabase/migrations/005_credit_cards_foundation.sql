-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 005 — Fundação do módulo de Cartões de Crédito (Fase 0)
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── CONTEXTO ─────────────────────────────────────────────────────────────
-- Fase 0 do Plano Executivo de Implementação do módulo de Cartões de Crédito
-- (arquitetura híbrida aprovada: cartão = Account + módulo próprio para
-- regras específicas). Esta migração só prepara o schema — nenhuma lógica
-- de negócio, nenhum trigger novo, nenhum código de aplicação depende dela
-- ainda. Os dois triggers de saldo existentes (recalculate_account_balance,
-- migração 004; update_balances_on_transfer, migração 003) NÃO são
-- alterados por esta migração.

-- ─── 1. accounts.type passa a aceitar 'cartao' ───────────────────────────
-- A constraint original (migração 001) foi declarada inline
-- (`type TEXT NOT NULL CHECK (type IN (...))`), então o Postgres gerou o
-- nome dela automaticamente — não é seguro assumir um nome fixo. O bloco
-- abaixo descobre o nome real da constraint de CHECK em accounts que
-- restringe `type` (identificada pela presença do valor literal
-- 'carteira', que não aparece em nenhuma outra constraint do sistema) e a
-- remove antes de recriar com o valor novo incluído.
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT con.conname INTO v_constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'accounts'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%carteira%';

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE accounts DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $$;

ALTER TABLE accounts ADD CONSTRAINT accounts_type_check
  CHECK (type IN ('carteira','corrente','poupanca','digital','investimentos','cartao'));

-- ─── 2. TABELA credit_cards — metadados específicos de cartão ───────────────
-- 1:1 com accounts via account_id UNIQUE: a conta carrega o saldo (reuso
-- total do trigger/dashboard/patrimônio/orçamento/histórico/IA já
-- existentes); esta tabela carrega só o que uma conta comum não tem.
-- closing_day/due_day limitados a 1-28 evita ambiguidade em meses de
-- 28/29/30/31 dias — decisão de simplicidade, documentada aqui.
CREATE TABLE IF NOT EXISTS credit_cards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id   UUID NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  limit_amount DECIMAL(14,2) NOT NULL CHECK (limit_amount > 0),
  closing_day  INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 28),
  due_day      INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 28),
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_cards_select" ON credit_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "credit_cards_insert" ON credit_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "credit_cards_update" ON credit_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "credit_cards_delete" ON credit_cards FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
