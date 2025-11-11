# MemoDrops Admin (Next.js 14 + TypeScript)

Dashboard administrativo para o MemoDrops, pronto para deploy no Railway.

## Rodar local

```bash
npm i
cp .env.example .env.local
# edite API_URL e NEXTAUTH_SECRET
npm run dev
```

Acesse http://localhost:3000/login

## Deploy no Railway

O projeto já inclui `railway.json` e `Procfile`. Conecte o repositório e defina as variáveis:

- `NODE_ENV=production`
- `NEXTAUTH_URL=https://admin.memodrops.com`
- `NEXTAUTH_SECRET=...`
- `API_URL=https://api.memodrops.com`

## Estrutura

- `app/(auth)/login` – login com NextAuth (Credentials)
- `app/(dashboard)` – layout protegido + módulos
- `lib/auth.ts` – configuração do NextAuth
- `lib/serverApi.ts` – fetch server-side com token
- `lib/api.ts` – cliente axios com token (client-side)

## Módulos

- Visão Geral (KPIs, gráficos)
- Usuários (lista + busca)
- Conteúdo (Concursos, Matérias)
- Financeiro (MRR, custos)
- Monitoramento (status, jobs BullMQ)

> Os endpoints consumidos estão alinhados ao documento "Endpoints Necessários no Backend para o Dashboard Admin".


## ✅ Incrementos incluídos nesta versão
- CRUD completo de **Concursos** e **Matérias** (modais).
- Ações de **Usuários**: adicionar cash e banir usuário.
- **Financeiro** com páginas de **Planos** (criar/editar) e **Custos** (criar).
- **Monitoramento** com listagem de jobs da fila (status, erro, tentar novamente).
- **RBAC**: Financeiro restrito a `superadmin` (UI e server‑side).
- **Toasts** e **Modal** nativos (leve) + Providers (Session/Toast).

### Endpoints esperados do backend
- `/admin/stats`, `/admin/users`, `/admin/contests`, `/admin/subjects`
- `/admin/finance/mrr`, `/admin/finance/costs`, `/admin/finance/plans`
- `/admin/queues/jobs?status=failed|active|waiting|completed`, `POST /admin/queues/jobs/:id/retry`

> Ajuste os nomes/rotas se o backend utilizar caminhos diferentes.
