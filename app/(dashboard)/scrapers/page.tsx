'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Scraper } from '@/types/scrapers';
import { ScraperModal } from '@/components/scrapers/ScraperModal';
import { TestModal } from '@/components/scrapers/TestModal';
import { LogsModal } from '@/components/scrapers/LogsModal';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ScrapersPage() {
  const [scrapers, setScrapers] = useState<Scraper[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({ category: 'all', status: 'all', search: '' });

  const [selected, setSelected] = useState<Scraper | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTest, setShowTest] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<string | null>(null);

  async function fetchScrapers(){
    try{
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const res = await fetch(`${API}/admin/scrapers?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const data = await res.json();
      setScrapers(data);
    } finally { setLoading(false); }
  }
  async function fetchStats(){
    const res = await fetch(`${API}/admin/scrapers/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    });
    setStats(await res.json());
  }
  useEffect(()=>{ fetchScrapers(); fetchStats(); /* eslint-disable-next-line */ }, [filters]);

  async function handleDelete(id: string){
    if (!confirm('Tem certeza que deseja deletar este scraper?')) return;
    await fetch(`${API}/admin/scrapers/${id}`, { method:'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
    fetchScrapers(); fetchStats();
  }

  const categoryColors: Record<string,string> = useMemo(()=> ({
    banca: 'bg-blue-100 text-blue-800',
    federal: 'bg-green-100 text-green-800',
    estadual: 'bg-yellow-100 text-yellow-800',
    justica: 'bg-purple-100 text-purple-800',
    municipal: 'bg-orange-100 text-orange-800',
    outros: 'bg-gray-100 text-gray-800',
  }), []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Scrapers</h1>
        <button onClick={()=>setShowCreate(true)} className="px-3 py-2 rounded-md bg-slate-800 text-white text-sm">➕ Novo Scraper</button>
      </div>

      {stats && (
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg"><div className="text-sm text-slate-600">Total de Scrapers</div><div className="text-2xl font-bold">{stats.total}</div></div>
          <div className="p-3 bg-slate-50 rounded-lg"><div className="text-sm text-slate-600">Ativos</div><div className="text-2xl font-bold text-green-600">{stats.active}</div></div>
          <div className="p-3 bg-slate-50 rounded-lg"><div className="text-sm text-slate-600">Com Erros</div><div className="text-2xl font-bold text-red-600">{stats.with_errors}</div></div>
          <div className="p-3 bg-slate-50 rounded-lg"><div className="text-sm text-slate-600">Taxa Sucesso</div><div className="text-2xl font-bold">{Number(stats.success_rate||0).toFixed(1)}%</div></div>
        </div>
      )}

      <div className="p-4 border rounded-lg bg-white">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select className="w-full border rounded px-3 py-2" value={filters.category} onChange={(e)=>setFilters({...filters, category:e.target.value})}>
              <option value="all">Todas</option>
              <option value="banca">Bancas</option>
              <option value="federal">Federal</option>
              <option value="estadual">Estadual</option>
              <option value="justica">Justiça</option>
              <option value="municipal">Municipal</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="w-full border rounded px-3 py-2" value={filters.status} onChange={(e)=>setFilters({...filters, status:e.target.value})}>
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Buscar</label>
            <input type="text" placeholder="Nome do scraper..." className="w-full border rounded px-3 py-2"
              value={filters.search} onChange={(e)=>setFilters({...filters, search:e.target.value})} />
          </div>
        </div>
      </div>

      {loading ? <div className="text-center py-12">Carregando…</div> : (
        <div className="border rounded-lg overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Categoria</th>
                <th className="text-left p-3">Hostname Pattern</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Último Teste</th>
                <th className="text-center p-3">Taxa Sucesso</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {scrapers.map((s)=> (
                <tr key={s.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-medium">{s.display_name}</div>
                    <div className="text-sm text-slate-500">{s.name}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${categoryColors[s.category] || categoryColors.outros}`}>{s.category}</span>
                  </td>
                  <td className="p-3">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{s.hostname_pattern}</code>
                  </td>
                  <td className="p-3 text-center">
                    {s.is_active ? <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">Ativo</span>
                                  : <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">Inativo</span>}
                  </td>
                  <td className="p-3 text-center text-sm">
                    {s.last_tested_at ? (
                      <div>
                        <div>{new Date(s.last_tested_at).toLocaleDateString('pt-BR')}</div>
                        <div className="text-xs">{s.last_test_success ? <span className="text-green-600">✓ Sucesso</span> : <span className="text-red-600">✗ Erro</span>}</div>
                      </div>
                    ) : <span className="text-slate-400">Nunca testado</span>}
                  </td>
                  <td className="p-3 text-center">
                    {s.total_tests && s.total_tests>0 ? (
                      <div>
                        <div className="font-semibold">{(((s.successful_tests||0)/(s.total_tests||1))*100).toFixed(0)}%</div>
                        <div className="text-xs text-slate-500">{s.successful_tests}/{s.total_tests}</div>
                      </div>
                    ) : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <button onClick={()=>setSelected(s)} className="btn text-sm" title="Editar">✏️</button>
                      <button onClick={()=>setShowTest(s.id)} className="btn text-sm" title="Testar">🧪</button>
                      <button onClick={()=>setShowLogs(s.id)} className="btn text-sm" title="Ver Logs">📊</button>
                      <button onClick={()=>handleDelete(s.id)} className="btn bg-red-100 text-red-800 text-sm" title="Deletar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <ScraperModal onClose={()=>setShowCreate(false)} onSaved={()=>{ setShowCreate(false); fetchScrapers(); fetchStats(); }} />
      )}
      {selected && (
        <ScraperModal scraper={selected} onClose={()=>setSelected(null)} onSaved={()=>{ setSelected(null); fetchScrapers(); fetchStats(); }} />
      )}
      {showTest && (
        <TestModal scraperId={showTest} onClose={()=>setShowTest(null)} />
      )}
      {showLogs && (
        <LogsModal scraperId={showLogs} onClose={()=>setShowLogs(null)} />
      )}
    </div>
  );
}
