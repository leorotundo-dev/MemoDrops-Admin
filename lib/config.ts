// Configuração da API
// Usando URL hardcoded para garantir funcionamento independente de variáveis de ambiente

export const API_CONFIG = {
  // URL da API backend
  API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api-production-5ffc.up.railway.app',
  
  // Timeout padrão para requisições
  TIMEOUT: 30000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Helper para obter URL completa de um endpoint
export function getApiUrl(endpoint: string): string {
  const baseUrl = API_CONFIG.API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}
