'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { Scraper } from '@/types/scrapers';
import { ScraperModal } from '@/components/scrapers/ScraperModal';
import { TestModal } from '@/components/scrapers/TestModal';
import { LogsModal } from '@/components/scrapers/LogsModal';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ScrapersPage() {
  const { data: session } = useSession();
  const [scrapers, setScrapers] = useState<Scraper[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({ category: 'all', status: 'all', search: '' });

  const [selected, setSelected] = useState<Scraper | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTest, setShowTest] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<string | null>(null);

  const token = (session as any)?.token;

  async function fetchScrapers(){
    if (!token) return;
    try{
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const res = await fetch(`/api/admin/scrapers?${params}`, { credentials: 'include' });
      const data = await res.json();
      setScrapers(Array.isArray(data) ? data : data.scrapers || data.items || []);
    } finally { setLoading(false); }
  }
  
  async function fetchStats(){
    if (!token) return;
    const res = await fetch(`/api/admin/scrapers/stats`, { credentials: 'include' });
    setStats(await res.json());
  }

  useEffect(() => { if (token) { fetchScrapers(); fetchStats(); } }, [filters, token]);

  const filtered = useMemo(() => {
    return scrapers.filter(s => {
      if (filters.category !== 'all' && s.category !== filters.category) return false;
      if (filters.status === 'active' && !s.is_active) return false;
      if (filters.status === 'inactive' && s.is_active) return false;
      if (filters.search && !s.display_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [scrapers, filters]);

  if (!session) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Scrapers</h1>
        <div className="flex gap-3">
          <a
            href="/scrapers/banks"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Ver Bancas Disponíveis (40)
          </a>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Novo Scraper
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-600">Ativos</div>
            <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-600">Com Erro</div>
            <div className="text-2xl font-bold text-red-600">{stats.with_errors || 0}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-600">Taxa de Sucesso</div>
            <div className="text-2xl font-bold">{stats.success_rate || 0}%</div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="all">Todas Categorias</option>
            <option value="banca">Banca</option>
            <option value="news">Notícias</option>
            <option value="other">Outro</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nenhum scraper encontrado</div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4">{s.display_name}</td>
                  <td className="px-6 py-4">{s.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {s.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => setSelected(s)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => setShowTest(s.id)} className="text-green-600 hover:underline">Testar</button>
                    <button onClick={() => setShowLogs(s.id)} className="text-gray-600 hover:underline">Logs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <ScraperModal
          token={token}
          onClose={() => { setShowCreate(false); fetchScrapers(); }}
        />
      )}

      {selected && (
        <ScraperModal
          token={token}
          scraper={selected}
          onClose={() => { setSelected(null); fetchScrapers(); }}
        />
      )}

      {showTest && (
        <TestModal
          token={token}
          scraperId={showTest}
          onClose={() => setShowTest(null)}
        />
      )}

      {showLogs && (
        <LogsModal
          token={token}
          scraperId={showLogs}
          onClose={() => setShowLogs(null)}
        />
      )}
    </div>
  );
}
