'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Banca } from '../../../types/bancas';
import { BancaModal } from '../../../components/bancas/BancaModal';
import { BancaDetailsModal } from '../../../components/bancas/BancaDetailsModal';
import { ImportModal } from '../../../components/bancas/ImportModal';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function BancasPage(){
  const { data: session } = useSession();
  const router = useRouter();
  const token = (session as any)?.token;
  const [bancas, setBancas] = useState<Banca[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [filters, setFilters] = useState({ status: 'all', area: 'all', search: '', sort: 'name' });

  const [selectedBanca, setSelectedBanca] = useState<Banca | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [logoTimestamp] = useState(Date.now()); // Cache busting para logos

  useEffect(()=>{ fetchBancas(); fetchStats(); /* eslint-disable-next-line */ }, [filters]);

  async function fetchBancas(){
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.area !== 'all') params.set('area', filters.area);
      if (filters.search) params.set('search', filters.search);
      if (filters.sort) params.set('sort', filters.sort);
      if (!token) return;
      const res = await fetch(`/api/admin/bancas?${params}`, { credentials: 'include' });
      const data = await res.json();
      setBancas(Array.isArray(data) ? data : data.bancas || data.items || []);
    } finally { setLoading(false); }
  }
  async function fetchStats(){
    if (!token) return;
    const res = await fetch(`/api/admin/bancas/stats`, { credentials: 'include' });
    setStats(await res.json());
  }

  async function handleDelete(id: string){
    if (!confirm('Tem certeza que deseja deletar esta banca?')) return;
    if (!token) return;
    await fetch(`/api/admin/bancas/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchBancas(); fetchStats();
  }

  const areaColors: Record<string,string> = useMemo(()=> ({
    federal: 'bg-blue-100 text-blue-800',
    estadual: 'bg-green-100 text-green-800',
    municipal: 'bg-yellow-100 text-yellow-800',
  }), []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bancas de Concursos</h1>
        <div className="flex gap-2">
          <button onClick={()=>setShowImportModal(true)} className="px-3 py-2 rounded-md border text-sm">📥 Importar CSV</button>
          <button onClick={()=>setShowCreateModal(true)} className="px-3 py-2 rounded-md bg-slate-800 text-white text-sm">➕ Nova Banca</button>
        </div>
      </div>

      {stats && (
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-3 border rounded-lg bg-white"><div className="text-sm text-slate-600">Total de Bancas</div><div className="text-2xl font-bold">{stats.total}</div></div>
          <div className="p-3 border rounded-lg bg-white"><div className="text-sm text-slate-600">Bancas Ativas</div><div className="text-2xl font-bold text-green-600">{stats.active}</div></div>
          <div className="p-3 border rounded-lg bg-white"><div className="text-sm text-slate-600">Total de Concursos</div><div className="text-2xl font-bold">{stats.total_contests}</div></div>
          <div className="p-3 border rounded-lg bg-white"><div className="text-sm text-slate-600">Banca Líder</div>
            <div className="text-lg font-bold">{stats.top_banca ? stats.top_banca.display_name : '-'}</div>
            {stats.top_banca && <div className="text-xs text-slate-500">{stats.top_banca.total_contests} concursos</div>}
          </div>
        </div>
      )}

      <div className="p-4 border rounded-lg bg-white">
        <div className="flex justify-between items-end">
          <div className="grid md:grid-cols-4 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar</label>
              <input value={filters.search} onChange={(e)=>setFilters({ ...filters, search: e.target.value})} type="text" placeholder="Nome da banca..." className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Área</label>
              <select value={filters.area} onChange={(e)=>setFilters({ ...filters, area: e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="all">Todas</option>
                <option value="federal">Federal</option>
                <option value="estadual">Estadual</option>
                <option value="municipal">Municipal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={filters.status} onChange={(e)=>setFilters({ ...filters, status: e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordenar por</label>
              <select value={filters.sort} onChange={(e)=>setFilters({ ...filters, sort: e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="name">Nome (A-Z)</option>
                <option value="contests">Mais concursos</option>
                <option value="recent">Mais recente</option>
              </select>
            </div>
          </div>
          <div className="ml-4 flex gap-2">
            <button onClick={()=>setViewMode('grid')} className={`px-3 py-2 rounded-md border text-sm ${viewMode==='grid'?'bg-slate-800 text-white':''}`}>🔲 Grid</button>
            <button onClick={()=>setViewMode('list')} className={`px-3 py-2 rounded-md border text-sm ${viewMode==='list'?'bg-slate-800 text-white':''}`}>📋 Lista</button>
          </div>
        </div>
      </div>

      {loading ? <div className="text-center py-12">Carregando...</div> : (
        viewMode==='grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bancas.map((b)=>(
              <div key={b.id} className="p-4 border rounded-lg bg-white hover:shadow transition-shadow">
                <div className="h-24 flex items-center justify-center mb-3 bg-slate-50 rounded relative">
                  <div className="text-4xl font-bold text-slate-300 absolute inset-0 flex items-center justify-center z-0">
                    {(b.short_name || b.display_name || b.name).slice(0,3).toUpperCase()}
                  </div>
                  <img 
                    src={`/logos.json?id=${b.id}`}
                    alt={b.display_name || b.name}
                    className="max-h-20 max-w-full object-contain relative z-10"
                    onLoad={async (e) => {
                      try {
                        const res = await fetch('/logos.json');
                        const logos = await res.json();
                        if (logos[b.id]) {
                          e.currentTarget.src = logos[b.id];
                          const fallback = e.currentTarget.previousElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'none';
                        }
                      } catch (err) {
                        console.error('Failed to load logo', err);
                      }
                    }}
                  />
                </div>
                <h3 className="font-bold text-lg mb-1 text-center">{b.display_name || b.short_name || b.name}</h3>
                <p className="text-sm text-slate-600 text-center mb-3 line-clamp-2">{b.description || b.display_name || b.name}</p>
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  {b.areas.map((a)=>(<span key={a} className={`px-2 py-1 rounded text-xs ${areaColors[a]}`}>{a}</span>))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-center text-sm">
                  <div>
                    <div className="font-bold text-lg">{b.total_contests}</div>
                    <div className="text-xs text-slate-600">Concursos</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{b.is_active ? <span className="text-green-600">✓</span> : <span className="text-gray-400">✗</span>}</div>
                    <div className="text-xs text-slate-600">Status</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>router.push(`/bancas/${String(b.id)}`)} className="px-3 py-2 rounded-md border text-sm flex-1">Ver Detalhes</button>
                  <button onClick={()=>setSelectedBanca(b)} className="px-3 py-2 rounded-md border text-sm">✏️</button>
                  <button onClick={()=>handleDelete(String(b.id))} className="px-3 py-2 rounded-md border text-sm text-red-700">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto bg-white">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Sigla</th>
                  <th className="text-left p-3">Áreas</th>
                  <th className="text-center p-3">Concursos</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {bancas.map((b)=>(
                  <tr key={b.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={`https://api-production-5ffc.up.railway.app/logos/bancas/${b.id}?t=${logoTimestamp}`} alt={b.display_name || b.name} className="h-8" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <div>
                          <div className="font-medium">{b.display_name}</div>
                          {b.website_url && <a href={b.website_url} target="_blank" className="text-xs text-blue-600">{b.website_url}</a>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{b.short_name || '-'}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {b.areas.map((a)=>(<span key={a} className={`px-2 py-1 rounded text-xs ${areaColors[a]}`}>{a}</span>))}
                      </div>
                    </td>
                    <td className="p-3 text-center font-semibold">{b.total_contests}</td>
                    <td className="p-3 text-center">
                      {b.is_active ? <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">Ativo</span> :
                                     <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">Inativo</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button onClick={()=>setShowDetailsModal(String(b.id))} className="px-3 py-2 rounded-md border text-sm">🔎</button>
                        <button onClick={()=>setSelectedBanca(b)} className="px-3 py-2 rounded-md border text-sm">✏️</button>
                        <button onClick={()=>handleDelete(String(b.id))} className="px-3 py-2 rounded-md border text-sm text-red-700">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modais */}
      {showCreateModal && (
        <BancaModal token={token} onClose={()=>setShowCreateModal(false)} onSave={()=>{ setShowCreateModal(false); fetchBancas(); fetchStats(); }} />
      )}
      {selectedBanca && (
        <BancaModal token={token} banca={selectedBanca} onClose={()=>setSelectedBanca(null)} onSave={()=>{ setSelectedBanca(null); fetchBancas(); fetchStats(); }} />
      )}
      {showDetailsModal && (
        <BancaDetailsModal token={token} bancaId={showDetailsModal} onClose={()=>setShowDetailsModal(null)} onEdit={(b)=>{ setShowDetailsModal(null); setSelectedBanca(b as any); }} />
      )}
      {showImportModal && (
        <ImportModal token={token} onClose={()=>setShowImportModal(false)} onImport={()=>{ setShowImportModal(false); fetchBancas(); fetchStats(); }} />
      )}
    </div>
  );
}
