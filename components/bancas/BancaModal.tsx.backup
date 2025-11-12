'use client';
import React, { useEffect, useMemo, useState } from 'react';
import type { Banca } from '../../types/bancas';

const API = process.env.NEXT_PUBLIC_API_URL;

const AREA_OPTIONS = ['federal','estadual','municipal'] as const;

export function BancaModal({ token, banca, onClose, onSave }: {
  token: string;
  banca?: Banca | null;
  onClose: ()=>void;
  onSave: ()=>void;
}){
  const isEdit = !!banca;
  const [form, setForm] = useState<any>({
    name: '', display_name:'', short_name:'', website_url:'', logo_url:'',
    description:'', areas: [] as string[], is_active:true, scraper_id: ''
  });
  const [scrapers, setScrapers] = useState<Array<{id:string, display_name:string}>>([]);

  useEffect(()=>{
    if (banca){
      setForm({
        name: banca.name,
        display_name: banca.display_name,
        short_name: banca.short_name || '',
        website_url: banca.website_url || '',
        logo_url: banca.logo_url || '',
        description: banca.description || '',
        areas: banca.areas || [],
        is_active: banca.is_active,
        scraper_id: banca.scraper_id || ''
      });
    }
  },[banca]);

  useEffect(()=>{
    (async ()=>{
      try {
        const res = await fetch(`${API}/admin/scrapers`, { headers:{ Authorization: `Bearer ${token||''}` }});
        const data = await res.json();
        setScrapers((data||[]).map((s:any)=>({ id:s.id, display_name:s.display_name })));
      } catch {}
    })();
  },[]);

  function setField(name: string, value: any){
    setForm((f:any)=> ({ ...f, [name]: value }));
  }

  function toggleArea(area: string){
    setForm((f:any)=> {
      const exists = f.areas.includes(area);
      return { ...f, areas: exists ? f.areas.filter((a:string)=>a!==area) : [...f.areas, area] };
    });
  }

  function validate(): string | null {
    if (!form.display_name?.trim()) return 'Display Name é obrigatório';
    if (!isEdit && !form.name?.trim()) return 'Name é obrigatório';
    if (form.areas.length === 0) return 'Selecione pelo menos uma área';
    return null;
  }

  async function save(){
    const err = validate();
    if (err) return alert(err);
    const payload: any = {
      name: form.name.trim(),
      display_name: form.display_name.trim(),
      short_name: form.short_name?.trim() || null,
      website_url: form.website_url?.trim() || null,
      logo_url: form.logo_url?.trim() || null,
      description: form.description?.trim() || null,
      areas: form.areas,
      is_active: !!form.is_active,
      scraper_id: form.scraper_id || null
    };
    const url = isEdit ? `${API}/admin/bancas/${banca!.id}` : `${API}/admin/bancas`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return alert('Falha ao salvar.');
    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">{isEdit? 'Editar Banca' : 'Nova Banca'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        {!isEdit && (
          <div className="mb-2 text-xs text-slate-500">* O campo <b>name</b> deve ser único (ex.: <code>fgv</code>)</div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input value={form.name} onChange={(e)=>setField('name', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="fgv" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Display Name *</label>
            <input value={form.display_name} onChange={(e)=>setField('display_name', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Fundação Getúlio Vargas" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sigla</label>
            <input value={form.short_name} onChange={(e)=>setField('short_name', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="FGV" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input value={form.website_url} onChange={(e)=>setField('website_url', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="https://www.fgv.br/" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input value={form.logo_url} onChange={(e)=>setField('logo_url', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea value={form.description} onChange={(e)=>setField('description', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Áreas *</label>
            <div className="flex flex-wrap gap-3">
              {AREA_OPTIONS.map(a => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.areas.includes(a)} onChange={()=>toggleArea(a)} /> {a}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Scraper Associado</label>
            <select value={form.scraper_id} onChange={(e)=>setField('scraper_id', e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Nenhum —</option>
              {scrapers.map(s=> <option key={s.id} value={s.id}>{s.display_name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input id="is_active" type="checkbox" checked={!!form.is_active} onChange={(e)=>setField('is_active', e.target.checked)} />
            <label htmlFor="is_active" className="text-sm">Ativo</label>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 border rounded-lg">
          <div className="text-sm text-slate-600 mb-2">Preview</div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="h-24 flex items-center justify-center bg-slate-50 rounded">
              {form.logo_url
                ? <img src={form.logo_url} alt={form.display_name} className="max-h-20 max-w-full" />
                : <div className="text-4xl font-bold text-slate-300">{(form.short_name || form.display_name || 'BNC').slice(0,3).toUpperCase()}</div>}
            </div>
            <div className="sm:col-span-2">
              <div className="font-semibold">{form.short_name || form.display_name || '—'}</div>
              <div className="text-sm text-slate-600">{form.description || '—'}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {form.areas.map((a:string)=>(<span key={a} className="px-2 py-1 text-xs rounded bg-slate-100">{a}</span>))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={save} className="px-3 py-2 rounded-md bg-slate-800 text-white text-sm">{isEdit? 'Salvar' : 'Criar'}</button>
        </div>
      </div>
    </div>
  );
}
