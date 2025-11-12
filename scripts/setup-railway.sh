#!/bin/bash

# Script para configurar variáveis de ambiente no Railway
# Uso: ./scripts/setup-railway.sh

set -e

echo "🚀 Configurando variáveis de ambiente no Railway..."
echo ""

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado!"
    echo "📦 Instale com: npm install -g @railway/cli"
    exit 1
fi

# Verificar se está logado
if ! railway whoami &> /dev/null; then
    echo "🔐 Fazendo login no Railway..."
    railway login
fi

# Configurar variáveis
echo "📝 Configurando variáveis..."

railway variables set NEXTAUTH_SECRET="etewMC7Xbhyykay8yGpdmXaT3L4nOjQ3f6piecOOcu8="
railway variables set NEXTAUTH_URL="https://admin.memodrops.com"
railway variables set API_URL="https://api.memodrops.com"
railway variables set NEXT_PUBLIC_API_URL="https://api.memodrops.com"
railway variables set NODE_ENV="production"

echo ""
echo "✅ Variáveis configuradas com sucesso!"
echo ""
echo "📋 Variáveis configuradas:"
railway variables

echo ""
echo "🎯 Próximos passos:"
echo "1. Aguarde o redeploy automático (2-3 minutos)"
echo "2. Acesse: https://admin.memodrops.com"
echo "3. Faça login com: admin@memodrops.com / admin123"
echo "4. Verifique se os dados estão carregando"
