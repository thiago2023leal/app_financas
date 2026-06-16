-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 003 — Transferências entre contas
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. TABELA transfers ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transfers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account_id UUID        NOT NULL REFERENCES accounts(id)   ON DELETE RESTRICT,
  to_account_id   UUID        NOT NULL REFERENCES accounts(id)   ON DELETE RESTRICT,
  amount          DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  date            DATE        NOT NULL,
  description     TEXT        NOT NULL DEFAULT 'Transferência',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CHECK (from_account_id != to_account_id)
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transfers_select" ON transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transfers_insert" ON transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transfers_update" ON transfers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transfers_delete" ON transfers FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_date    ON transfers(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transfers_from    ON transfers(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to      ON transfers(to_account_id);

-- ─── 2. TRIGGER: atualizar saldos em ambas as contas ─────────────────────────
--
-- Estratégia delta: mais simples e adequada para aplicação single-user.
-- O trigger da tabela transactions (trg_recalculate_balance) continua
-- inalterado e cuida das receitas/despesas normais.
--
-- Nota: ao chamar recalculateBalance() via application code (ex: edição de
-- saldo inicial), a função em accounts.service.ts foi atualizada para
-- considerar também transfers — garantindo consistência total.

CREATE OR REPLACE FUNCTION update_balances_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.from_account_id;
    UPDATE accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.to_account_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.from_account_id;
    UPDATE accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.to_account_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverter valores antigos
    UPDATE accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.from_account_id;
    UPDATE accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.to_account_id;
    -- Aplicar valores novos
    UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.from_account_id;
    UPDATE accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.to_account_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_transfer_balances ON transfers;
CREATE TRIGGER trg_transfer_balances
  AFTER INSERT OR UPDATE OR DELETE ON transfers
  FOR EACH ROW EXECUTE FUNCTION update_balances_on_transfer();
