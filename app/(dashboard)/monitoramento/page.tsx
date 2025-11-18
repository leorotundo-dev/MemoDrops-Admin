'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface ScraperStatus {
  banca: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  found: number;
  saved: number;
  message?: string;
  lastRun?: string;
}

export default function MonitoramentoPage() {
  const { data: session } = useSession();
  const token = (session as any)?.token;
  const [scrapers, setScrapers] = useState<ScraperStatus[]>([]);
  const [globalStatus, setGlobalStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    
    // Poll status every 3 seconds
    const interval = setInterval(fetchStatus, 3000);
    fetchStatus(); // Initial fetch
    
    return () => clearInterval(interval);
  }, [token]);

  async function fetchStatus() {
    if (!token) return;
    
    try {
      const res = await fetch('https://api-production-5ffc.up.railway.app/admin/scrapers/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setScrapers(data.scrapers || []);
        setGlobalStatus(data.globalStatus || 'idle');
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch scraper status:', error);
    }
  }

  async function handleRunScrapers() {
    if (!confirm('Iniciar scraping de todas as bancas?')) return;
    if (!token) return;

    try {
      const res = await fetch('https://api-production-5ffc.up.railway.app/admin/bancas/scrape-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (res.ok) {
        alert('Scrapers iniciados! Acompanhe o progresso abaixo.');
        fetchStatus();
      } else {
        const data = await res.json();
        alert('Erro: ' + (data.message || 'Falha ao iniciar scrapers'));
      }
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  }

  const statusColors = {
    idle: 'bg-gray-100 text-gray-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700'
  };

  const statusIcons = {
    idle: '⏸️',
    running: '🔄',
    completed: '✅',
    error: '❌'
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento de Scrapers</h1>
          <p className="text-sm text-gray-600">Acompanhe o progresso dos scrapers em tempo real</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRunScrapers}
            disabled={globalStatus === 'running'}
            className={`px-4 py-2 rounded-md text-white ${
              globalStatus === 'running' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {globalStatus === 'running' ? '⏳ Rodando...' : '🔍 Iniciar Scrapers'}
          </button>
          <button 
            onClick={fetchStatus}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Status Global */}
      <div className={`p-4 rounded-lg ${statusColors[globalStatus]}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{statusIcons[globalStatus]}</span>
          <div>
            <div className="font-bold">Status Global: {globalStatus.toUpperCase()}</div>
            <div className="text-sm">
              {globalStatus === 'running' && 'Scrapers em execução...'}
              {globalStatus === 'completed' && 'Todos os scrapers concluídos'}
              {globalStatus === 'idle' && 'Aguardando execução'}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Scrapers */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Scrapers por Banca</h2>
        </div>
        <div className="divide-y">
          {scrapers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum scraper em execução. Clique em "Iniciar Scrapers" para começar.
            </div>
          ) : (
            scrapers.map((scraper, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{statusIcons[scraper.status]}</span>
                    <div>
                      <div className="font-bold">{scraper.banca}</div>
                      <div className="text-sm text-gray-600">{scraper.message || 'Aguardando...'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{scraper.saved} / {scraper.found}</div>
                    <div className="text-xs text-gray-600">Salvos / Encontrados</div>
                  </div>
                </div>
                {scraper.status === 'running' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scraper.progress}%` }}
                    ></div>
                  </div>
                )}
                {scraper.lastRun && (
                  <div className="text-xs text-gray-500 mt-1">
                    Última execução: {new Date(scraper.lastRun).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
          <div className="font-bold mb-2">📋 Logs em Tempo Real</div>
          {logs.map((log, idx) => (
            <div key={idx} className="text-xs">{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
