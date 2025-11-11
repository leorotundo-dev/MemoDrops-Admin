'use client';
import { useEffect, useState } from 'react';
import type { ScraperLog } from '@/types/scrapers';

const API = process.env.NEXT_PUBLIC_API_URL;

export function LogsModal({ token, scraperId, onClose }: { token: string; scraperId: string; onClose: ()=>void; }){
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [status, setStatus] = useState<'all'|'success'|'error'|'timeout'>('all');

  async function load(){
    const params = new URLSearchParams();
    if (status!=='all') params.set('status', status);
    const res = await fetch(`${API}/admin/scrapers/${scraperId}/logs?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    setLogs(await res.json());
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [scraperId, status]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Logs do Scraper</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm">Filtrar status:</label>
          <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="all">Todos</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="timeout">Timeout</option>
          </select>
          <button onClick={load} className="ml-auto px-3 py-2 rounded-md bg-slate-800 text-white text-sm">Atualizar</button>
        </div>

        <div className="border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 text-left">Data</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">URL</th>
                <th className="p-2 text-right">Matérias</th>
                <th className="p-2 text-right">Tempo (ms)</th>
                <th className="p-2 text-left">Erro</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l)=> (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.created_at}</td>
                  <td className="p-2">{l.status}</td>
                  <td className="p-2"><a className="text-blue-600 hover:underline" href={l.url} target="_blank">{l.url}</a></td>
                  <td className="p-2 text-right">{l.materias_found}</td>
                  <td className="p-2 text-right">{l.execution_time}</td>
                  <td className="p-2">{l.error_message || '—'}</td>
                </tr>
              ))}
              {logs.length===0 && <tr><td colSpan={6} className="p-3 text-center text-slate-500">Sem logs</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
