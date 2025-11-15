'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ProcessingResult {
  contestId: string;
  contestName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  materias?: number;
  topicos?: number;
  subtopicos?: number;
}

export function BatchProcessor() {
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [contests, setContests] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Buscar concursos com edital_url mas sem matérias
  useEffect(() => {
    if (!token) return;

    const fetchContests = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests?unprocessed=true`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const json = await res.json();
        setContests(json.data || []);
      } catch (e) {
        console.error(e);
      }
    };

    fetchContests();
  }, [token]);

  const processContest = async (contest: any): Promise<ProcessingResult> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests/${contest.id}/process-hierarquia`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ editalUrl: contest.edital_url }),
        }
      );

      if (res.ok) {
        const result = await res.json();
        return {
          contestId: contest.id,
          contestName: contest.name,
          status: 'success',
          materias: result.materias || 0,
          topicos: result.topicos || 0,
          subtopicos: result.subtopicos || 0,
        };
      } else {
        const error = await res.json();
        return {
          contestId: contest.id,
          contestName: contest.name,
          status: 'error',
          message: error.message || 'Erro desconhecido',
        };
      }
    } catch (error: any) {
      return {
        contestId: contest.id,
        contestName: contest.name,
        status: 'error',
        message: error.message || 'Erro de conexão',
      };
    }
  };

  const startBatchProcessing = async () => {
    if (contests.length === 0) return;

    setProcessing(true);
    setResults([]);
    setCurrentIndex(0);

    const newResults: ProcessingResult[] = contests.map((c) => ({
      contestId: c.id,
      contestName: c.name,
      status: 'pending',
    }));
    setResults(newResults);

    for (let i = 0; i < contests.length; i++) {
      setCurrentIndex(i);
      
      // Atualizar status para "processing"
      setResults((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: 'processing' } : r
        )
      );

      // Processar concurso
      const result = await processContest(contests[i]);

      // Atualizar resultado
      setResults((prev) =>
        prev.map((r, idx) => (idx === i ? result : r))
      );

      // Delay de 2 segundos entre processamentos
      if (i < contests.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setProcessing(false);
  };

  const stats = results.reduce(
    (acc, r) => {
      if (r.status === 'success') acc.success++;
      if (r.status === 'error') acc.error++;
      if (r.status === 'pending') acc.pending++;
      return acc;
    },
    { success: 0, error: 0, pending: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Processamento em Lote</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{contests.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Processados</p>
            <p className="text-2xl font-bold text-green-700">{stats.success}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">Falhas</p>
            <p className="text-2xl font-bold text-red-700">{stats.error}</p>
          </div>
        </div>

        {contests.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={startBatchProcessing}
              disabled={processing}
              className="btn btn-primary w-full"
            >
              {processing
                ? `⏳ Processando ${currentIndex + 1}/${contests.length}...`
                : `🚀 Processar ${contests.length} Concursos`}
            </button>

            {processing && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / contests.length) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {contests.length === 0 && !processing && (
          <div className="text-center py-8 text-gray-500">
            <p>✅ Todos os concursos com edital_url já foram processados!</p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-md font-semibold mb-4">Resultados</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, idx) => (
              <div
                key={result.contestId}
                className={`p-3 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : result.status === 'processing'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">
                      {result.contestName}
                    </p>
                    {result.status === 'success' && (
                      <p className="text-xs text-gray-600">
                        ✅ {result.materias} matérias, {result.topicos} tópicos,{' '}
                        {result.subtopicos} subtópicos
                      </p>
                    )}
                    {result.status === 'error' && (
                      <p className="text-xs text-red-600">❌ {result.message}</p>
                    )}
                    {result.status === 'processing' && (
                      <p className="text-xs text-blue-600">⏳ Processando...</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 ml-2">
                    {idx + 1}/{results.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
