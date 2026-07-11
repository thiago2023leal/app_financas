-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 006 — Bandeira do cartão de crédito (Fase 3)
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── CONTEXTO ─────────────────────────────────────────────────────────────
-- Fase 3 do Plano Executivo de Implementação do módulo de Cartões de
-- Crédito. Adiciona a bandeira do cartão como metadado de identificação
-- visual, aprovada durante a apresentação do protótipo da Fase 3 — sem
-- nenhum impacto em regras financeiras (saldo, limite, fatura). Lista
-- fechada (mesmo padrão de `type`/`frequency`/`status` já usado no
-- schema), não texto livre.
--
-- Migração 005 (Fase 0) já está aplicada em produção — esta migração
-- estende a tabela credit_cards de forma aditiva, não a reescreve.

ALTER TABLE credit_cards
  ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'outros'
    CHECK (brand IN ('visa','mastercard','elo','amex','hipercard','outros'));
