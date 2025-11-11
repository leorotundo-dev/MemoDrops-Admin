'use client';
import React, { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

function parseCSV(text: string){
  // parser simples (suporta , ou ;). Não trata aspas aninhadas complexas.
  const sep = text.includes(';') && !text.includes(',') ? ';' : ',';
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
  const header = lines.shift()!.split(sep).map(h=>h.trim());
  const out: any[] = [];
  for (const line of lines){
    const cols = line.split(sep);
    const item: any = {};
    header.forEach((h, i)=> item[h] = cols[i] ? cols[i].trim() : '');
    if (item.areas){
      try { item.areas = JSON.parse(item.areas); } catch { item.areas = []; }
    } else item.areas = [];
    out.push(item);
  }
  return out;
}

export function ImportModal({ onClose, onImport }: { onClose: ()=>void; onImport: ()=>void; }){
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFile(e: any){
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const txt = await f.text();
    const data = parseCSV(txt);
    setParsed(data);
  }

  async function runImport(){
    if (!parsed || parsed.length===0) return alert('Selecione um CSV válido.');
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${API}/admin/bancas/import`, {
      method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ bancas: parsed })
    });
    setLoading(false);
    if (!res.ok) return alert('Falha ao importar.');
    const j = await res.json();
    alert(`Importadas: ${j.success}\nErros: ${j.errors?.length || 0}`);
    onImport();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Importar Bancas por CSV</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        <div className="space-y-3">
          <input type="file" accept=".csv,text/csv" onChange={onFile} />
          {fileName && <div className="text-sm text-slate-600">Arquivo: {fileName}</div>}
          {parsed && (
            <div className="text-sm text-slate-600">Encontradas {parsed.length} linhas</div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={runImport} disabled={!parsed || loading} className="px-3 py-2 rounded-md bg-slate-800 text-white text-sm">{loading? 'Importando…' : 'Importar'}</button>
        </div>
      </div>
    </div>
  );
}
