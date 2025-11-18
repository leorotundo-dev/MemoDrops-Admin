'use client';
import React, { useEffect, useState } from 'react';
import type { Banca } from '../../types/bancas';

const API = process.env.NEXT_PUBLIC_API_URL;
const AREA_OPTIONS = ['federal','estadual','municipal'] as const;

interface BankConfig {
  slug: string;
  name: string;
  listUrl: string;
  listLinkPatterns: string[];
  editalInclude?: string[];
  editalExclude?: string[];
}

export function BancaModal({ banca, onClose }: {
  banca?: Banca | null;
  onClose: ()=>void;
}){
  const isEdit = !!banca;
  const [step, setStep] = useState<'select' | 'form'>(isEdit ? 'form' : 'select');
  const [availableBanks, setAvailableBanks] = useState<BankConfig[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState<any>({
    name: '', display_name:'', short_name:'', website_url:'', logo_url:'',
    description:'', area: 'federal', is_active:true, scraper_config: null
  });
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
        area: banca.area || 'federal',
        is_active: banca.is_active,
        scraper_config: null
      });
    }
  },[banca]);
  
  useEffect(()=>{
    if (!isEdit) {
      loadAvailableBanks();
    }
  },[isEdit]);
  
  async function loadAvailableBanks() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/admin/available-banks`);
      const data = await res.json();
      setAvailableBanks(data.banks || []);
    } catch (err) {
      console.error('Erro ao carregar bancas disponíveis:', err);
    } finally {
      setLoading(false);
    }
  }
  
  function handleSelectBank(bank: BankConfig) {
    setSelectedBank(bank);
    setForm({
      name: bank.slug,
      display_name: bank.name,
      short_name: bank.name,
      website_url: bank.listUrl,
      logo_url: '',
      description: `Banca ${bank.name}`,
      area: 'federal',
      is_active: true,
      scraper_config: {
        listUrl: bank.listUrl,
        listLinkPatterns: bank.listLinkPatterns,
        editalInclude: bank.editalInclude,
        editalExclude: bank.editalExclude
      }
    });
    setStep('form');
  }
  
  function setField(name: string, value: any){
    setError('');
    setForm((f:any)=> ({ ...f, [name]: value }));
  }
  
  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.display_name){
      setError('Preencha os campos obrigatórios');
      return;
    }
    
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/admin/bancas/${banca!.id}` : '/api/admin/bancas';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }
  
  const filteredBanks = availableBanks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Banca' : step === 'select' ? 'Selecionar Banca' : 'Cadastrar Banca'}
            </h2>
            {step === 'form' && selectedBank && (
              <p className="text-sm text-gray-600 mt-1">
                Configurando: <span className="font-semibold">{selectedBank.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            <>
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Buscar banca por nome ou sigla..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <p className="text-sm text-gray-600 mt-2">
                  {filteredBanks.length} de {availableBanks.length} bancas disponíveis
                </p>
              </div>

              {/* Banks Grid */}
              {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando bancas...</div>
              ) : filteredBanks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhuma banca encontrada para "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Limpar busca
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredBanks.map((bank) => (
                    <button
                      key={bank.slug}
                      onClick={() => handleSelectBank(bank)}
                      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{bank.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{bank.slug}</p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600 truncate">{bank.listUrl}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Manual Option */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedBank(null);
                    setStep('form');
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-700 font-medium"
                >
                  ➕ Cadastrar banca manualmente (sem configuração pré-definida)
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {!isEdit && selectedBank && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>✓ Configuração automática:</strong> Os campos foram preenchidos com base na banca selecionada. Você pode ajustá-los conforme necessário.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome/Slug *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="fgv"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome de Exibição *</label>
                    <input
                      type="text"
                      value={form.display_name}
                      onChange={(e) => setField('display_name', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="FGV"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Curto</label>
                    <input
                      type="text"
                      value={form.short_name}
                      onChange={(e) => setField('short_name', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="FGV"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Área</label>
                    <select
                      value={form.area}
                      onChange={(e) => setField('area', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      {AREA_OPTIONS.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Website URL</label>
                  <input
                    type="url"
                    value={form.website_url}
                    onChange={(e) => setField('website_url', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={(e) => setField('logo_url', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Descrição da banca..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setField('is_active', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">Banca ativa</label>
                </div>

                {selectedBank && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Configuração de Scraper</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <strong>URL:</strong> {selectedBank.listUrl}
                      </div>
                      <div>
                        <strong>Padrões:</strong> {selectedBank.listLinkPatterns.join(', ')}
                      </div>
                      {selectedBank.editalInclude && selectedBank.editalInclude.length > 0 && (
                        <div>
                          <strong>Incluir:</strong> {selectedBank.editalInclude.join(', ')}
                        </div>
                      )}
                      {selectedBank.editalExclude && selectedBank.editalExclude.length > 0 && (
                        <div>
                          <strong>Excluir:</strong> {selectedBank.editalExclude.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setStep('select')}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Voltar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isEdit ? 'Salvar Alterações' : 'Cadastrar Banca'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
