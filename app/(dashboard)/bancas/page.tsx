'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Banca } from '../../../types/bancas';
import { BancaModal } from '../../../components/bancas/BancaModal';
import { BancaDetailsModal } from '../../../components/bancas/BancaDetailsModal';
import { ImportModal } from '../../../components/bancas/ImportModal';

// Importar componentes de Scrapers
import type { Scraper } from '@/types/scrapers';
import { ScraperModal } from '@/components/scrapers/ScraperModal';
import { TestModal } from '@/components/scrapers/TestModal';
import { LogsModal } from '@/components/scrapers/LogsModal';

const API = process.env.NEXT_PUBLIC_API_URL;

type TabType = 'bancas' | 'scrapers';

export default function BancasPage(){
  const { data: session } = useSession();
  const router = useRouter();
  const token = (session as any)?.token;
  
  const [activeTab, setActiveTab] = useState<TabType>('bancas');
  
  // Estados para Bancas
  const [bancas, setBancas] = useState<Banca[]>([]);
  const [loadingBancas, setLoadingBancas] = useState(true);
  const [statsBancas, setStatsBancas] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [filtersBancas, setFiltersBancas] = useState({ status: 'all', area: 'all', search: '', sort: 'name' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedBanca, setSelectedBanca] = useState<Banca | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [logos, setLogos] = useState<Record<string, string>>({});

  // Estados para Scrapers
  const [scrapers, setScrapers] = useState<Scraper[]>([]);
  const [loadingScrapers, setLoadingScrapers] = useState(true);
  const [statsScrapers, setStatsScrapers] = useState<any>(null);
  const [filtersScrapers, setFiltersScrapers] = useState({ category: 'all', status: 'all', search: '' });
  const [selectedScraper, setSelectedScraper] = useState<Scraper | null>(null);
  const [showCreateScraper, setShowCreateScraper] = useState(false);
  const [showTest, setShowTest] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<string | null>(null);

  useEffect(()=>{ 
    if (activeTab === 'bancas') {
      fetchBancas(); 
      fetchStatsBancas(); 
      fetchLogos();
      setCurrentPage(1);
    } else {
      fetchScrapers();
      fetchStatsScrapers();
    }
  }, [activeTab, filtersBancas, filtersScrapers, token]);

  async function fetchLogos() {
    try {
      const res = await fetch('/banca-logos.json');
      const data = await res.json();
      setLogos(data);
    } catch (err) {
      console.error('Failed to load logos', err);
    }
  }

  // Funções para Bancas
  async function fetchBancas(){
    try {
      setLoadingBancas(true);
      const params = new URLSearchParams();
      if (filtersBancas.status !== 'all') params.set('status', filtersBancas.status);
      if (filtersBancas.area !== 'all') params.set('area', filtersBancas.area);
      if (filtersBancas.search) params.set('search', filtersBancas.search);
      if (filtersBancas.sort) params.set('sort', filtersBancas.sort);
      if (!token) return;
      const res = await fetch(`/api/admin/bancas?${params}`, { credentials: 'include' });
      const data = await res.json();
      setBancas(Array.isArray(data) ? data : data.bancas || data.items || []);
    } finally { setLoadingBancas(false); }
  }

  async function fetchStatsBancas(){
    if (!token) return;
    const res = await fetch(`/api/admin/bancas/stats`, { credentials: 'include' });
    setStatsBancas(await res.json());
  }

  async function handleUpdateCounts() {
    if (!confirm('Atualizar contadores de concursos de todas as bancas?')) return;
    if (!token) {
      alert('Você precisa estar logado!');
      return;
    }
    try {
      const res = await fetch('https://api-production-5ffc.up.railway.app/admin/bancas/update-counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Contadores atualizados!');
        fetchBancas();
        fetchStatsBancas();
      } else {
        alert('Erro ao atualizar contadores');
      }
    } catch (err) {
      alert('Erro: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleRunScrapers() {
    if (!confirm('Rodar todos os scrapers ativos?')) return;
    if (!token) return;
    try {
      const res = await fetch('https://api-production-5ffc.up.railway.app/admin/bancas/run-scrapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Scrapers iniciados!');
      } else {
        alert('Erro ao iniciar scrapers');
      }
    } catch (err) {
      alert('Erro: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar esta banca?')) return;
    if (!token) return;
    await fetch(`/api/admin/bancas/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchBancas(); fetchStatsBancas();
  }

  // Funções para Scrapers
  async function fetchScrapers(){
    if (!token) return;
    try{
      setLoadingScrapers(true);
      const params = new URLSearchParams();
      if (filtersScrapers.category !== 'all') params.set('category', filtersScrapers.category);
      if (filtersScrapers.status !== 'all') params.set('status', filtersScrapers.status);
      if (filtersScrapers.search) params.set('search', filtersScrapers.search);
      const res = await fetch(`/api/admin/scrapers?${params}`, { credentials: 'include' });
      const data = await res.json();
      setScrapers(Array.isArray(data) ? data : data.scrapers || data.items || []);
    } finally { setLoadingScrapers(false); }
  }
  
  async function fetchStatsScrapers(){
    if (!token) return;
    const res = await fetch(`/api/admin/scrapers/stats`, { credentials: 'include' });
    setStatsScrapers(await res.json());
  }

  const filteredScrapers = useMemo(() => {
    return scrapers.filter(s => {
      if (filtersScrapers.category !== 'all' && s.category !== filtersScrapers.category) return false;
      if (filtersScrapers.status === 'active' && !s.is_active) return false;
      if (filtersScrapers.status === 'inactive' && s.is_active) return false;
      if (filtersScrapers.search && !s.name.toLowerCase().includes(filtersScrapers.search.toLowerCase())) return false;
      return true;
    });
  }, [scrapers, filtersScrapers]);

  const areaColors: Record<string,string> = useMemo(()=> ({
    federal: 'bg-blue-100 text-blue-800',
    estadual: 'bg-green-100 text-green-800',
    municipal: 'bg-yellow-100 text-yellow-800',
  }), []);

  const filtered = useMemo(() => {
    return bancas.filter(b => {
      if (filtersBancas.status === 'active' && !b.is_active) return false;
      if (filtersBancas.status === 'inactive' && b.is_active) return false;
      if (filtersBancas.area !== 'all' && !b.areas?.includes(filtersBancas.area)) return false;
      if (filtersBancas.search && !b.display_name?.toLowerCase().includes(filtersBancas.search.toLowerCase())) return false;
      return true;
    });
  }, [bancas, filtersBancas]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (filtersBancas.sort === 'name') arr.sort((a,b) => (a.display_name||'').localeCompare(b.display_name||''));
    if (filtersBancas.sort === 'contests') arr.sort((a,b) => (b.total_contests||0) - (a.total_contests||0));
    return arr;
  }, [filtered, filtersBancas.sort]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  if (!session) return <div className="p-8">Carregando...</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header com Abas */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bancas & Scrapers</h1>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab('bancas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'bancas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 Bancas Cadastradas
            </button>
            <button
              onClick={() => setActiveTab('scrapers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'scrapers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔍 Scrapers
            </button>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          {activeTab === 'bancas' ? (
            <>
              <button onClick={handleRunScrapers} className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700">🔍 Rodar Scrapers</button>
              <button onClick={handleUpdateCounts} className="px-4 py-2 rounded-md bg-purple-600 text-white">🔄 Atualizar Contadores</button>
              <button onClick={()=>setShowImportModal(true)} className="px-4 py-2 rounded-md bg-blue-600 text-white">📥 Importar CSV</button>
              <button onClick={()=>setShowCreateModal(true)} className="px-4 py-2 rounded-md bg-green-600 text-white">➕ Nova Banca</button>
            </>
          ) : (
            <button onClick={() => setShowCreateScraper(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Novo Scraper
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'bancas' ? (
        <>
          {/* Stats Bancas */}
          {statsBancas && (
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg bg-white"><div className="text-sm text-slate-600">Total de Bancas</div><div className="text-2xl font-bold">{statsBancas.total}</div></div>
              <div className="p-3 border rounded-lg bg-white"><div className="text-sm text-slate-600">Bancas Ativas</div><div className="text-2xl font-bold text-green-600">{statsBancas.active}</div></div>
              <div className="p-3 border rounded-lg bg-white"><div className="text-sm text-slate-600">Total de Concursos</div><div className="text-2xl font-bold">{statsBancas.total_contests}</div></div>
              <div className="p-3 border rounded-lg bg-white"><div className="text-sm text-slate-600">Banca Líder</div>
                <div className="text-lg font-bold">{statsBancas.top_banca ? statsBancas.top_banca.display_name : '-'}</div>
                {statsBancas.top_banca && <div className="text-xs text-slate-500">{statsBancas.top_banca.total_contests} concursos</div>}
              </div>
            </div>
          )}

          {/* Filtros Bancas */}
          <div className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-end">
              <div className="grid md:grid-cols-4 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium mb-1">Buscar</label>
                  <input value={filtersBancas.search} onChange={(e)=>setFiltersBancas({ ...filtersBancas, search: e.target.value})} type="text" placeholder="Nome da banca..." className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Área</label>
                  <select value={filtersBancas.area} onChange={(e)=>setFiltersBancas({ ...filtersBancas, area: e.target.value})} className="w-full border rounded px-3 py-2">
                    <option value="all">Todas</option>
                    <option value="federal">Federal</option>
                    <option value="estadual">Estadual</option>
                    <option value="municipal">Municipal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={filtersBancas.status} onChange={(e)=>setFiltersBancas({ ...filtersBancas, status: e.target.value})} className="w-full border rounded px-3 py-2">
                    <option value="all">Todos</option>
                    <option value="active">Ativas</option>
                    <option value="inactive">Inativas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ordenar por</label>
                  <select value={filtersBancas.sort} onChange={(e)=>setFiltersBancas({ ...filtersBancas, sort: e.target.value})} className="w-full border rounded px-3 py-2">
                    <option value="name">Nome (A-Z)</option>
                    <option value="contests">Mais Concursos</option>
                  </select>
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <button onClick={()=>setViewMode('grid')} className={`p-2 border rounded ${viewMode==='grid'?'bg-blue-100 border-blue-500':''}`}>📊 Grid</button>
                <button onClick={()=>setViewMode('list')} className={`p-2 border rounded ${viewMode==='list'?'bg-blue-100 border-blue-500':''}`}>📋 Lista</button>
              </div>
            </div>
          </div>

          {/* Lista de Bancas */}
          {loadingBancas ? (
            <div className="text-center py-8">Carregando bancas...</div>
          ) : viewMode === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map(b => (
                <div key={b.id} className="border rounded-lg p-4 bg-white hover:shadow-lg transition">
                  <div className="flex items-center gap-3 mb-3">
                    {logos[b.display_name?.toLowerCase().replace(/\s+/g, '-') || ''] ? (
                      <img src={logos[b.display_name?.toLowerCase().replace(/\s+/g, '-') || '']} alt={b.display_name || ''} className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center text-2xl font-bold text-slate-400">
                        {b.display_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-lg">{b.display_name}</div>
                      <div className="text-sm text-slate-500">{b.display_name?.toLowerCase().replace(/\s+/g, '-') || ''}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {b.areas && b.areas.length > 0 && <span className={`text-xs px-2 py-1 rounded ${areaColors[b.areas[0]]}`}>{b.areas[0]}</span>}
                    <span className={`text-xs px-2 py-1 rounded ${b.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {b.is_active ? '✓ Ativa' : '✗ Inativa'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <div className="font-bold text-lg">{b.total_contests}</div>
                      <div className="text-xs text-slate-600">Concursos</div>
                    </div>

                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setShowDetailsModal(String(b.id))} className="flex-1 px-3 py-2 text-sm border rounded hover:bg-slate-50">Ver Detalhes</button>
                    <button onClick={()=>setSelectedBanca(b)} className="px-3 py-2 text-sm border rounded hover:bg-slate-50">✏️</button>
                    <button onClick={()=>handleDelete(String(b.id))} className="px-3 py-2 text-sm border rounded hover:bg-red-50 text-red-600">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-3">Logo</th>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Sigla</th>
                    <th className="text-left p-3">Áreas</th>
                    <th className="text-center p-3">Concursos</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(b => (
                    <tr key={b.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        {logos[b.display_name?.toLowerCase().replace(/\s+/g, '-') || ''] ? (
                          <img src={logos[b.display_name?.toLowerCase().replace(/\s+/g, '-') || '']} alt={b.display_name || ''} className="w-12 h-12 object-contain" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400">
                            {b.display_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium">{b.display_name}</td>
                      <td className="p-3 text-sm text-slate-600">{b.display_name?.toLowerCase().replace(/\s+/g, '-') || ''}</td>
                      <td className="p-3">
                        {b.areas && b.areas.length > 0 && <span className={`text-xs px-2 py-1 rounded ${areaColors[b.areas[0]]}`}>{b.areas[0]}</span>}
                      </td>
                      <td className="p-3 text-center font-bold">{b.total_contests}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded ${b.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {b.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={()=>setShowDetailsModal(String(b.id))} className="px-2 py-1 text-xs border rounded hover:bg-slate-50">Ver</button>
                          <button onClick={()=>setSelectedBanca(b)} className="px-2 py-1 text-xs border rounded hover:bg-slate-50">Editar</button>
                          <button onClick={()=>handleDelete(String(b.id))} className="px-2 py-1 text-xs border rounded hover:bg-red-50 text-red-600">Deletar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
              <span className="px-3 py-1">Página {currentPage} de {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Próxima</button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Stats Scrapers */}
          {statsScrapers && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded shadow">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold">{statsScrapers.total || 0}</div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-sm text-gray-600">Ativos</div>
                <div className="text-2xl font-bold text-green-600">{statsScrapers.active || 0}</div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-sm text-gray-600">Com Erro</div>
                <div className="text-2xl font-bold text-red-600">{statsScrapers.with_errors || 0}</div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                <div className="text-2xl font-bold">{statsScrapers.success_rate || 0}%</div>
              </div>
            </div>
          )}

          {/* Filtros Scrapers */}
          <div className="bg-white p-4 rounded shadow mb-4">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Buscar..."
                value={filtersScrapers.search}
                onChange={(e) => setFiltersScrapers({ ...filtersScrapers, search: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <select
                value={filtersScrapers.category}
                onChange={(e) => setFiltersScrapers({ ...filtersScrapers, category: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="all">Todas Categorias</option>
                <option value="banca">Banca</option>
                <option value="portal">Portal</option>
                <option value="custom">Custom</option>
              </select>
              <select
                value={filtersScrapers.status}
                onChange={(e) => setFiltersScrapers({ ...filtersScrapers, status: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="all">Todos Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>

          {/* Lista de Scrapers */}
          {loadingScrapers ? (
            <div className="text-center py-8">Carregando scrapers...</div>
          ) : filteredScrapers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum scraper encontrado</div>
          ) : (
            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Categoria</th>
                    <th className="text-left p-3">URL</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Última Exec.</th>
                    <th className="text-center p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScrapers.map(s => (
                    <tr key={s.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">{s.category}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-600 truncate max-w-xs">{s.test_url || s.hostname_pattern}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {s.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm text-gray-600">
                        {s.last_tested_at ? new Date(s.last_tested_at).toLocaleString('pt-BR') : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => setShowTest(s.id)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Testar</button>
                          <button onClick={() => setShowLogs(s.id)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Logs</button>
                          <button onClick={() => setSelectedScraper(s)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Editar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modais */}
      {showCreateModal && <BancaModal onClose={()=>{ setShowCreateModal(false); fetchBancas(); fetchStatsBancas(); }} />}
      {selectedBanca && <BancaModal banca={selectedBanca} onClose={()=>{ setSelectedBanca(null); fetchBancas(); fetchStatsBancas(); }} />}
      {showDetailsModal && <BancaDetailsModal bancaId={showDetailsModal} onClose={()=>setShowDetailsModal(null)} />}
      {showImportModal && <ImportModal onClose={()=>{ setShowImportModal(false); fetchBancas(); fetchStatsBancas(); }} />}
      
      {showCreateScraper && <ScraperModal onClose={()=>{ setShowCreateScraper(false); fetchScrapers(); }} />}
      {selectedScraper && <ScraperModal scraper={selectedScraper} onClose={()=>{ setSelectedScraper(null); fetchScrapers(); }} />}
      {showTest && <TestModal scraperId={showTest} onClose={()=>setShowTest(null)} />}
      {showLogs && <LogsModal scraperId={showLogs} onClose={()=>setShowLogs(null)} />}
    </div>
  );
}
