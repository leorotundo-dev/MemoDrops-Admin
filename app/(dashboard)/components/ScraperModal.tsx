'use client';
import { useEffect, useState } from 'react';
import type { Scraper } from '@/types/scrapers';

const API = process.env.NEXT_PUBLIC_API_URL;
const CATEGORIES = ['banca','federal','estadual','justica','municipal','outros'] as const;

export function ScraperModal({ scraper, onClose, onSaved }: { scraper?: Scraper|null; onClose: ()=>void; onSaved: ()=>void; }){
  const [form, setForm] = useState<any>({
    name:'', display_name:'', category:'banca', hostname_pattern:'', adapter_file:'', is_active:true, priority:100, description:'', test_url:''
  });
  const isEdit = !!scraper;

  useEffect(()=>{
    if (scraper) setForm({
      name: scraper.name, display_name: scraper.display_name, category: scraper.category, hostname_pattern: scraper.hostname_pattern,
      adapter_file: scraper.adapter_file, is_active: scraper.is_active, priority: scraper.priority, description: scraper.description || '', test_url: scraper.test_url || ''
    });
  },[scraper]);

  function onChange(e:any){
    const { name, value, type, checked } = e.target;
    setForm((f:any)=> ({ ...f, [name]: type==='checkbox'? checked : value }));
  }

  function validate(): string | null {
    if (!form.display_name || !form.name || !form.category || !form.hostname_pattern || !form.adapter_file) return 'Preencha todos os campos obrigatórios *';
    // validação simples de regex (tenta compilar)
    try { new RegExp(form.hostname_pattern); } catch { return 'Hostname pattern inválido (regex)'; }
    if (!CATEGORIES.includes(form.category)) return 'Categoria inválida';
    if (String(form.priority).trim()==='' || isNaN(Number(form.priority))) return 'Prioridade inválida';
    return null;
  }

  async function save(){
    const err = validate();
    if (err) { alert(err); return; }
    const token = localStorage.getItem('token') || '';
    const payload: any = { ...form };
    const url = isEdit ? `${API}/admin/scrapers/${scraper!.id}` : `${API}/admin/scrapers`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    if (!res.ok) { alert('Falha ao salvar'); return; }
    onSaved();
  }

  async function testNow(){
    const token = localStorage.getItem('token') || '';
    const url = isEdit ? `${API}/admin/scrapers/${scraper!.id}/test` : null;
    if (!url) { alert('Salve antes de testar'); return; }
    const testUrl = form.test_url || prompt('Informe a URL de teste:');
    if (!testUrl) return;
    const res = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ url: testUrl }) });
    const data = await res.json();
    alert(`Status: ${data.status}\nMatérias: ${data.materias_found}\nTempo: ${data.execution_time}ms${data.error_message? '\nErro: '+data.error_message:''}`);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">{isEdit? 'Editar Scraper' : 'Novo Scraper'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        {!isEdit && (
          <div className="mb-2 text-xs text-slate-500">* Ao criar um novo scraper, o campo <b>name</b> deve ser único (ex.: <code>cebraspe</code>)</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="cebraspe" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Display Name *</label>
            <input name="display_name" value={form.display_name} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="Cebraspe/CESPE" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria *</label>
            <select name="category" value={form.category} onChange={onChange} className="w-full border rounded px-3 py-2">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hostname Pattern (regex) *</label>
            <input name="hostname_pattern" value={form.hostname_pattern} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="cebraspe\.org\.br" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adapter File *</label>
            <input name="adapter_file" value={form.adapter_file} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="bancas/cebraspe.ts" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <input name="priority" value={form.priority} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea name="description" value={form.description} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">URL de Teste</label>
            <input name="test_url" value={form.test_url} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="https://www.cebraspe.org.br/..." />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input id="is_active" type="checkbox" name="is_active" checked={!!form.is_active} onChange={onChange} />
            <label htmlFor="is_active" className="text-sm">Ativo</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          {isEdit && <button onClick={testNow} className="px-3 py-2 rounded-md bg-slate-100 text-slate-900 text-sm">🧪 Testar Agora</button>}
          <button onClick={save} className="px-3 py-2 rounded-md bg-slate-800 text-white text-sm">{isEdit? 'Salvar' : 'Criar'}</button>
        </div>
      </div>
    </div>
  );
}
