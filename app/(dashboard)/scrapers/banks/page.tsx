'use client';

import { useState, useEffect } from 'react';

interface Bank {
  slug: string;
  name: string;
}

interface BankDetails {
  slug: string;
  name: string;
  listUrl: string;
  listLinkPatterns: string[];
  editalInclude?: string[];
  editalExclude?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-5ffc.up.railway.app';

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBanks();
  }, []);

  async function loadBanks() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/admin/available-banks`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar bancas: ${response.status}`);
      }
      
      const data = await response.json();
      setBanks(data.banks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar bancas:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadBankDetails(slug: string) {
    try {
      const response = await fetch(`${API_URL}/admin/available-banks/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar detalhes: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedBank(data);
    } catch (err) {
      console.error('Erro ao carregar detalhes da banca:', err);
    }
  }

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando bancas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Erro ao carregar bancas</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={loadBanks}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bancas Disponíveis</h1>
          <p className="text-gray-600 mt-1">
            {banks.length} bancas configuradas no sistema
          </p>
        </div>
        <button
          onClick={loadBanks}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <input
          type="text"
          placeholder="Buscar banca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBanks.map((bank) => (
          <div
            key={bank.slug}
            onClick={() => loadBankDetails(bank.slug)}
            className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{bank.name}</h3>
                <p className="text-sm text-gray-500">{bank.slug}</p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
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
          </div>
        ))}
      </div>

      {filteredBanks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhuma banca encontrada para "{searchTerm}"
        </div>
      )}

      {/* Bank Details Modal */}
      {selectedBank && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBank(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedBank.name}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Slug: <code className="bg-gray-100 px-2 py-1 rounded">{selectedBank.slug}</code>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBank(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* List URL */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">URL de Listagem</h3>
                <a
                  href={selectedBank.listUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {selectedBank.listUrl}
                </a>
              </div>

              {/* Link Patterns */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Padrões de Link</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBank.listLinkPatterns.map((pattern, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edital Include */}
              {selectedBank.editalInclude && selectedBank.editalInclude.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Termos de Inclusão</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBank.editalInclude.map((term, idx) => (
                      <span
                        key={idx}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Edital Exclude */}
              {selectedBank.editalExclude && selectedBank.editalExclude.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Termos de Exclusão</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBank.editalExclude.map((term, idx) => (
                      <span
                        key={idx}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedBank(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
