'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

export function TestModal({ token, scraperId, onClose }: { token: string; scraperId: string; onClose: ()=>void; }){
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    // tenta buscar o test_url default
    fetch(`${API}/admin/scrapers/${scraperId}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r=>r.json()).then((s)=> setUrl(s?.test_url || ''));
  },[scraperId]);

  async function run(){
    setLoading(true); setResult(null);
    const res = await fetch(`${API}/admin/scrapers/${scraperId}/test`, {
      method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    setResult(data); setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Testar Scraper</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium">URL para testar</label>
          <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://..." className="w-full border rounded px-3 py-2" />
          <div className="flex justify-end">
            <button onClick={run} disabled={!url || loading} className="px-3 py-2 rounded-md bg-slate-800 text-white text-sm">{loading? 'Executando…' : 'Executar'}</button>
          </div>
          {result && (
            <div className="border rounded p-3 bg-slate-50">
              <div><b>Status:</b> {result.status}</div>
              <div><b>Matérias encontradas:</b> {result.materias_found}</div>
              <div><b>Tempo:</b> {result.execution_time} ms</div>
              {result.error_message && <div className="text-red-600"><b>Erro:</b> {result.error_message}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
