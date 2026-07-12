# L-Finanças

Aplicativo pessoal de finanças construído com Next.js 16 (App Router) e Supabase (Postgres + PostgREST + RLS). Gerencia contas, transações, transferências, orçamentos, metas, recorrências, integração Open Finance (Pluggy) e um assistente de IA transacional.

## Stack

- **Frontend**: Next.js 16, React, TanStack Query v5, Tailwind CSS
- **Backend**: Supabase (Postgres, RLS, triggers de saldo)
- **IA**: assistente conversacional com extração estruturada de lançamentos (Claude/OpenAI, adapter intercambiável)
- **Open Finance**: integração via Pluggy

## Getting Started

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Copie `.env.local` (não versionado) com as credenciais do Supabase e das integrações de IA/Open Finance antes de rodar localmente.

## Módulos

- **Contas** — carteira, corrente, poupança, digital, investimentos e cartão de crédito, com saldo único (`current_balance`) mantido por trigger SQL.
- **Transações** — receitas/despesas por categoria, com histórico e filtros.
- **Transferências** — movimentação entre contas, inclusive pagamento de fatura de cartão.
- **Orçamentos** e **Metas** — acompanhamento por categoria/mês e por objetivo financeiro.
- **Recorrências** — lançamentos recorrentes com confirmação manual de pagamento.
- **Open Finance** — sincronização de contas bancárias via Pluggy.
- **IA transacional** — lançamento de transações por linguagem natural, com extração estruturada, card de confirmação editável e execução real do lançamento.
- **Cartões de Crédito** — módulo em desenvolvimento incremental por fases (ver Roadmap abaixo). Cartão é modelado como uma `Account` do tipo `cartao`, com metadados próprios (limite, bandeira, fechamento, vencimento) em uma tabela dedicada.

## Roadmap — Módulo de Cartões de Crédito

Desenvolvimento faseado, documentado no PRD Arquitetural + Plano Executivo do projeto (uma fase por vez, com gate de homologação obrigatório entre elas).

| Fase | Descrição | Status |
|---|---|---|
| 0 | Fundação de schema (`accounts.type='cartao'` + tabela `credit_cards`) | ✅ Concluída |
| 1 | Validação matemática do modelo de saldo/dívida | ✅ Concluída |
| 2 | Cartão como tipo de `Account` | ✅ Concluída |
| 3 | Metadados do cartão (bandeira, limite, fechamento, vencimento) | ✅ Concluída |
| 4 | Validação: compra no cartão integrada a Dashboard/Patrimônio/Orçamento/Histórico/IA | ✅ Concluída |
| 5 | Fatura computada + pagamento via transferência | ✅ Concluída |
| 6 | Limite disponível | 🔜 Próxima etapa |
| 7 | Guardas de negócio + correção do mapeamento Open Finance | Pendente |
| 8 | Recorrências no cartão + enriquecimento do prompt de IA | Pendente |
| 9 | Parcelamento | Fora de escopo (projetada, não agendada) |
| 10 | Fatura persistida + histórico de faturas | Pendente |
| 11 | Cartão virtual / cartões adicionais | Pendente |

## Deploy

Produção: [Vercel](https://vercel.com) — publicada exclusivamente a partir da branch `main`, após homologação em ambiente local. Ver `CHANGELOG.md.txt` para o histórico de releases.
