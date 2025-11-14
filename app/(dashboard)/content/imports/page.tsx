'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';

type ImportStats = {
  banca: string;
  concursos: number;
  arquivos: number;
  arquivos_processados: number;
  questoes: number;
  questoes_revisadas: number;
};

export default function ImportsPage() {
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const { push } = useToast();

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/import/fgv-stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setJsonFile(file);
    } else {
      push('Por favor, selecione um arquivo JSON válido', 'error');
    }
  };

  const handleImport = async () => {
    if (!jsonFile) {
      push('Selecione um arquivo JSON primeiro', 'error');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const fileContent = await jsonFile.text();
      const jsonData = JSON.parse(fileContent);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/import/fgv-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(jsonData)
      });

      if (res.ok) {
        const result = await res.json();
        setImportResult(result);
        push('Importação concluída com sucesso!', 'success');
        fetchStats(); // Atualizar estatísticas
      } else {
        const error = await res.json();
        push(`Erro na importação: ${error.error || 'Erro desconhecido'}`, 'error');
      }
    } catch (e: any) {
      push(`Erro ao processar arquivo: ${e.message}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard de Importação</h1>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Concursos</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.concursos || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Arquivos</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.arquivos || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats?.arquivos_processados || 0} processados
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Questões</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.questoes || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats?.questoes_revisadas || 0} revisadas
          </p>
        </div>
      </div>

      {/* Upload de JSON */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Importar Metadados FGV</h2>
        <p className="text-sm text-gray-600">
          Faça upload do arquivo <code className="bg-gray-100 px-2 py-1 rounded">concursos_detalhes.json</code> para importar concursos e arquivos.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar arquivo JSON
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {jsonFile && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Arquivo selecionado: {jsonFile.name}
              </p>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={!jsonFile || importing}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importando...' : 'Iniciar Importação'}
          </button>
        </div>
      </div>

      {/* Resultado da Importação */}
      {importResult && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold">Resultado da Importação</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Concursos Inseridos</p>
              <p className="text-2xl font-bold text-green-600">{importResult.concursos_inseridos}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Concursos Atualizados</p>
              <p className="text-2xl font-bold text-blue-600">{importResult.concursos_atualizados}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Arquivos Inseridos</p>
              <p className="text-2xl font-bold text-purple-600">{importResult.arquivos_inseridos}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Arquivos Duplicados</p>
              <p className="text-2xl font-bold text-orange-600">{importResult.arquivos_duplicados}</p>
            </div>
          </div>

          {importResult.erros > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-800">
                ⚠️ {importResult.erros} erro(s) durante a importação
              </p>
            </div>
          )}

          {/* Detalhes */}
          {importResult.detalhes && importResult.detalhes.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Detalhes:</h3>
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arquivos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importResult.detalhes.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.slug}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'inserido' ? 'bg-green-100 text-green-800' :
                            item.status === 'atualizado' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">{item.arquivos || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
