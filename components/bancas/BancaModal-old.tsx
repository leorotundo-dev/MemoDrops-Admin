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
  const [error, setError] = useState<string>('');
  
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
    setError(''); // Limpar erro ao editar
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
    setError('');
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    
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
    
    try {
      const res = await fetch(url, {
        method, 
        headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        
        // Tratar erro 409 (Conflict - banca duplicada)
        if (res.status === 409) {
          setError(errorData.message || 'Já existe uma banca com este nome ou sigla');
          return;
        }
        
        setError(errorData.error || 'Falha ao salvar banca');
        return;
      }
      
      onSave();
    } catch (e) {
      setError('Erro de conexão. Tente novamente.');
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">{isEdit? 'Editar Banca' : 'Nova Banca'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}
        
        {!isEdit && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            ℹ️ O campo <b>name</b> deve ser único e não pode ser alterado depois (ex.: <code>fgv</code>, <code>cespe</code>)
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-3">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">Name * <span className="text-xs text-slate-500">(único)</span></label>
              <input 
                value={form.name} 
                onChange={(e)=>setField('name', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,''))} 
                className="w-full border rounded px-3 py-2" 
                placeholder="fgv" 
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Display Name *</label>
            <input value={form.display_name} onChange={(e)=>setField('display_name', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Fundação Getúlio Vargas" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sigla <span className="text-xs text-slate-500">(única)</span></label>
            <input value={form.short_name} onChange={(e)=>setField('short_name', e.target.value.toUpperCase())} className="w-full border rounded px-3 py-2" placeholder="FGV" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input value={form.website_url} onChange={(e)=>setField('website_url', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="https://www.fgv.br/" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input value={form.logo_url} onChange={(e)=>setField('logo_url', e.target.value)} className="w-full border rounded px-3 py-2" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Scraper</label>
            <select value={form.scraper_id} onChange={(e)=>setField('scraper_id', e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Nenhum</option>
              {scrapers.map(s=><option key={s.id} value={s.id}>{s.display_name}</option>)}
            </select>
          </div>
        </div>
        
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea value={form.description} onChange={(e)=>setField('description', e.target.value)} className="w-full border rounded px-3 py-2" rows={3} placeholder="Descrição da banca..." />
        </div>
        
        <div className="mt-3">
          <label className="block text-sm font-medium mb-2">Áreas * <span className="text-xs text-slate-500">(selecione pelo menos uma)</span></label>
          <div className="flex gap-2">
            {AREA_OPTIONS.map(area=>(
              <button key={area} onClick={()=>toggleArea(area)} className={`px-3 py-1 rounded text-sm ${form.areas.includes(area)?'bg-blue-500 text-white':'bg-slate-100 text-slate-700'}`}>
                {area}
              </button>
            ))}
          </div>
        </div>
        
        {isEdit && (
          <div className="mt-3 flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e)=>setField('is_active', e.target.checked)} id="active" />
            <label htmlFor="active" className="text-sm">Banca ativa</label>
          </div>
        )}
        
        <div className="mt-6 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-slate-50">Cancelar</button>
          <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Salvar</button>
        </div>
      </div>
    </div>
  );
}
