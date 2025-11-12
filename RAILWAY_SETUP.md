# Configuração do Dashboard Admin no Railway

## 🚀 Deploy Automático

Este repositório está configurado para deploy automático no Railway dentro do projeto **MemoDrops 2**.

## 📋 Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no Railway (Settings → Variables):

### Obrigatórias

```bash
# NextAuth - Autenticação
NEXTAUTH_SECRET=etewMC7Xbhyykay8yGpdmXaT3L4nOjQ3f6piecOOcu8=
NEXTAUTH_URL=https://admin.memodrops.com

# API Backend
API_URL=https://api.memodrops.com
NEXT_PUBLIC_API_URL=https://api.memodrops.com

# Ambiente
NODE_ENV=production
```

### Opcionais

```bash
# Apenas se precisar acesso direto ao banco
DATABASE_URL=postgresql://user:password@host:5432/db
```

## 🔧 Como Configurar no Railway

### Via Interface Web

1. Acesse: https://railway.app/project/[seu-projeto-id]
2. Clique no serviço **agile-dedication** (Dashboard Admin)
3. Vá em **Variables**
4. Clique em **+ New Variable**
5. Adicione cada variável acima

### Via Railway CLI

```bash
# Login
railway login

# Linkar ao projeto
railway link

# Adicionar variáveis
railway variables set NEXTAUTH_SECRET="etewMC7Xbhyykay8yGpdmXaT3L4nOjQ3f6piecOOcu8="
railway variables set NEXTAUTH_URL="https://admin.memodrops.com"
railway variables set API_URL="https://api.memodrops.com"
railway variables set NEXT_PUBLIC_API_URL="https://api.memodrops.com"
railway variables set NODE_ENV="production"
```

## 🎯 Estrutura do Projeto Railway

```
📦 MemoDrops 2 (Projeto)
├── 🔧 agile-dedication (Dashboard Admin - Next.js)
├── 🔧 api-production (Backend API - Fastify)
└── 🗄️ postgres (Database)
```

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] `NEXTAUTH_SECRET` gerado com valor seguro (não usar placeholder)
- [ ] `NEXT_PUBLIC_API_URL` adicionado (necessário para o frontend)
- [ ] Deploy concluído sem erros
- [ ] Login funcionando (admin@memodrops.com / admin123)
- [ ] Dados carregando nas páginas (Usuários, Scrapers, Bancas)

## 🔍 Troubleshooting

### Erro: "Application error: a client-side exception has occurred"
- Verificar se `NEXTAUTH_SECRET` está configurado
- Verificar se `NEXT_PUBLIC_API_URL` existe

### Erro: 401 Unauthorized nas chamadas API
- Verificar se `credentials: 'include'` está nas chamadas fetch
- Verificar se o proxy `/api/admin/*` está funcionando

### Dados não carregam
- Verificar se `NEXT_PUBLIC_API_URL` está correto
- Verificar se a API backend está online
- Verificar logs do serviço no Railway

## 📚 Documentação

- [Railway Docs](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NextAuth.js](https://next-auth.js.org)

## 🔗 Links Úteis

- **Dashboard:** https://admin.memodrops.com
- **API Backend:** https://api.memodrops.com
- **Railway Dashboard:** https://railway.app/dashboard
