'use client';
import React, { useEffect, useState } from 'react';
import type { Banca, BancaYearStat } from '../../types/bancas';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL;

export function BancaDetailsModal({ token, bancaId, onClose, onEdit }: { token: string; bancaId: string; onClose: ()=>void; onEdit: (b: Banca)=>void; }){
  const [banca, setBanca] = useState<Banca | null>(null);
  const [stats, setStats] = useState<BancaYearStat[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [refreshingLogo, setRefreshingLogo] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const [b, s, c] = await Promise.all([
        fetch(`${API}/admin/bancas/${bancaId}`, { headers:{ Authorization: `Bearer ${token}` }}).then(r=>r.json()),
        fetch(`${API}/admin/bancas/${bancaId}/stats`, { headers:{ Authorization: `Bearer ${token}` }}).then(r=>r.json()),
        fetch(`${API}/admin/bancas/${bancaId}/contests`, { headers:{ Authorization: `Bearer ${token}` }}).then(r=>r.json())
      ]);
      setBanca(b); setStats(s||[]); setContests(c||[]);
    })();
  },[bancaId]);

  if (!banca) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">{banca.short_name || banca.display_name}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-slate-600 mb-2">Estatísticas por Ano</div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_contests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="">
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-slate-600 mb-2">Informações</div>
              <div className="mb-2">
                <img src={`${API}/logos/bancas/${bancaId}`} alt={banca.display_name} className="h-16 mb-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <button 
                  onClick={async () => {
                    setRefreshingLogo(true);
                    try {
                      const res = await fetch(`${API}/logos/bancas/${bancaId}/refresh`, { 
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (res.ok) {
                        alert('Logo atualizado com sucesso!');
                        window.location.reload();
                      } else {
                        alert('Erro ao atualizar logo');
                      }
                    } catch (err) {
                      alert('Erro ao atualizar logo');
                    } finally {
                      setRefreshingLogo(false);
                    }
                  }}
                  disabled={refreshingLogo}
                  className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                >
                  {refreshingLogo ? '🔄 Atualizando...' : '🔄 Atualizar Logo'}
                </button>
              </div>
              <div className="text-sm"><b>Nome:</b> {banca.display_name}</div>
              {banca.website_url && <div className="text-sm"><b>Site:</b> <a href={banca.website_url} className="text-blue-600 hover:underline" target="_blank">{banca.website_url}</a></div>}
              <div className="text-sm"><b>Áreas:</b> {banca.areas.join(', ') || '—'}</div>
              <div className="text-sm"><b>Status:</b> {banca.is_active ? 'Ativa' : 'Inativa'}</div>
              {banca.scraper_name && <div className="text-sm"><b>Scraper:</b> {banca.scraper_name}</div>}
              <div className="mt-3">
                <button onClick={()=>onEdit(banca)} className="px-3 py-2 rounded-md bg-slate-800 text-white text-sm">Editar</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 border rounded-lg">
          <div className="text-sm text-slate-600 mb-2">Concursos Recentes</div>
          {contests.length === 0 ? (
            <div className="text-slate-500 text-sm">Sem concursos listados ainda.</div>
          ) : (
            <ul className="list-disc pl-6 text-sm">
              {contests.map((c, i)=>(<li key={i}>{c.title || 'Concurso'} — {c.date || ''}</li>))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
