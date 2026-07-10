-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 004 — Unificação do cálculo de saldo (trigger SQL vs app layer)
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── CONTEXTO ─────────────────────────────────────────────────────────────
-- trg_recalculate_balance (migração 001) recalculava current_balance
-- considerando APENAS `transactions`, ignorando `transfers`. Qualquer
-- INSERT/UPDATE/DELETE em `transactions` numa conta que já tivesse
-- recebido/enviado uma transferência sobrescrevia current_balance do zero,
-- descartando o efeito de qualquer transferência já aplicada àquela conta.
--
-- accounts.service.ts (recalculateBalance, app-level) já soma transfers
-- corretamente desde a migração 003 — mas só é chamado manualmente ao
-- editar o saldo inicial de uma conta. O trigger nunca foi atualizado
-- (a própria migração 003 documentava essa lacuna sem fechá-la).
--
-- Esta migração unifica as duas fontes de verdade: o trigger passa a usar
-- exatamente a mesma fórmula do app-level:
--   current_balance = initial_balance + Σ(transações) - Σ(transfers enviadas) + Σ(transfers recebidas)

-- ─── 1. FUNÇÃO: recalcular saldo (agora inclui transfers) ────────────────
CREATE OR REPLACE FUNCTION recalculate_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_account_id UUID;
BEGIN
  v_account_id := COALESCE(NEW.account_id, OLD.account_id);
  IF v_account_id IS NOT NULL THEN
    UPDATE accounts
    SET current_balance = initial_balance
      + (
          SELECT COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE -amount END), 0)
          FROM transactions
          WHERE account_id = v_account_id
        )
      - (
          SELECT COALESCE(SUM(amount), 0)
          FROM transfers
          WHERE from_account_id = v_account_id
        )
      + (
          SELECT COALESCE(SUM(amount), 0)
          FROM transfers
          WHERE to_account_id = v_account_id
        )
    WHERE id = v_account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- O trigger em si já existe (migração 001); recriar apenas garante que
-- aponta para a versão atualizada da função acima.
DROP TRIGGER IF EXISTS trg_recalculate_balance ON transactions;
CREATE TRIGGER trg_recalculate_balance
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION recalculate_account_balance();

-- ─── 2. BACKFILL: corrigir saldos já divergentes hoje ─────────────────────
-- Sem isso, contas que não recebem uma nova transação após esta migração
-- continuariam com o valor errado já persistido até a próxima escrita em
-- `transactions`. Aplica a mesma fórmula acima a todas as contas de uma vez.
UPDATE accounts a
SET current_balance = a.initial_balance
  + COALESCE((
      SELECT SUM(CASE WHEN t.type = 'receita' THEN t.amount ELSE -t.amount END)
      FROM transactions t WHERE t.account_id = a.id
    ), 0)
  - COALESCE((
      SELECT SUM(tr.amount) FROM transfers tr WHERE tr.from_account_id = a.id
    ), 0)
  + COALESCE((
      SELECT SUM(tr.amount) FROM transfers tr WHERE tr.to_account_id = a.id
    ), 0);
