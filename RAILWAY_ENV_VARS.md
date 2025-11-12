# Variáveis de Ambiente Necessárias no Railway

Para que o Admin Dashboard funcione corretamente, as seguintes variáveis de ambiente devem estar configuradas no Railway:

## Variáveis Obrigatórias

### 1. NEXTAUTH_SECRET
**Descrição**: Chave secreta para criptografia de tokens JWT do NextAuth.

**Como gerar**:
```bash
openssl rand -base64 32
```

**Exemplo**:
```
NEXTAUTH_SECRET=abc123xyz789randomsecretkey456def
```

### 2. NEXTAUTH_URL
**Descrição**: URL pública do Admin Dashboard.

**Valor**:
```
NEXTAUTH_URL=https://memodrops-admin-production.up.railway.app
```

### 3. NEXT_PUBLIC_API_URL
**Descrição**: URL da API backend.

**Valor**:
```
NEXT_PUBLIC_API_URL=https://api-production-5ffc.up.railway.app
```

### 4. API_URL
**Descrição**: URL da API backend (usado no servidor).

**Valor**:
```
API_URL=https://api-production-5ffc.up.railway.app
```

## Como Configurar no Railway

1. Acesse o projeto no Railway
2. Clique no serviço "Admin"
3. Vá em "Variables"
4. Adicione cada variável acima
5. Faça um novo deploy

## Verificação

Após configurar, faça login novamente e a sessão deve persistir por 30 dias.
