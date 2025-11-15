'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Stats {
  contests: number;
  subjects: number;
  topicos: number;
  subtopicos: number;
  drops: number;
  public_decks: number;
  public_cards: number;
}

interface ContestStats {
  total: number;
  with_edital_url: number;
  processed: number;
  unprocessed: number;
}

export default function ContentDashboardPage() {
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [stats, setStats] = useState<Stats | null>(null);
  const [contestStats, setContestStats] = useState<ContestStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        // Estatísticas gerais
        const statsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/stats`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const statsJson = await statsRes.json();
        setStats(statsJson.content);

        // Estatísticas de concursos
        const contestRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/exec-sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              sql: `
                SELECT 
                  COUNT(*) as total,
                  COUNT(CASE WHEN edital_url IS NOT NULL AND edital_url != '' THEN 1 END) as with_edital_url,
                  COUNT(DISTINCT m.contest_id) as processed
                FROM concursos c
                LEFT JOIN materias m ON m.contest_id = c.id
              `,
            }),
          }
        );
        const contestJson = await contestRes.json();
        const row = contestJson.rows[0];
        setContestStats({
          total: parseInt(row.total),
          with_edital_url: parseInt(row.with_edital_url),
          processed: parseInt(row.processed),
          unprocessed: parseInt(row.with_edital_url) - parseInt(row.processed),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard de Conteúdo</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do sistema de gestão de concursos e conteúdo
        </p>
      </div>

      {/* Estatísticas de Concursos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Concursos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold">{contestStats?.total || 0}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Com Edital</p>
            <p className="text-3xl font-bold text-blue-700">
              {contestStats?.with_edital_url || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Processados</p>
            <p className="text-3xl font-bold text-green-700">
              {contestStats?.processed || 0}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-700">
              {contestStats?.unprocessed || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas de Conteúdo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📚 Conteúdo Gerado</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Matérias</p>
            <p className="text-3xl font-bold text-purple-700">
              {stats?.subjects || 0}
            </p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600">Tópicos</p>
            <p className="text-3xl font-bold text-indigo-700">
              {stats?.topicos || 0}
            </p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <p className="text-sm text-pink-600">Subtópicos</p>
            <p className="text-3xl font-bold text-pink-700">
              {stats?.subtopicos || 0}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">Drops</p>
            <p className="text-3xl font-bold text-orange-700">
              {stats?.drops || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">⚡ Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/content/contests"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <h3 className="font-semibold mb-2">📋 Gerenciar Concursos</h3>
            <p className="text-sm text-gray-600">
              Ver, editar e criar concursos
            </p>
          </Link>

          <Link
            href="/content/batch-processing"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <h3 className="font-semibold mb-2">🚀 Processamento em Lote</h3>
            <p className="text-sm text-gray-600">
              Processar múltiplos concursos automaticamente
            </p>
          </Link>

          <Link
            href="/bancas"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <h3 className="font-semibold mb-2">🏢 Gerenciar Bancas</h3>
            <p className="text-sm text-gray-600">
              Configurar bancas organizadoras
            </p>
          </Link>

          <Link
            href="/content/subjects"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <h3 className="font-semibold mb-2">📚 Matérias</h3>
            <p className="text-sm text-gray-600">
              Gerenciar matérias e conteúdo
            </p>
          </Link>

          <Link
            href="/content/questions"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors"
          >
            <h3 className="font-semibold mb-2">❓ Questões</h3>
            <p className="text-sm text-gray-600">
              Importar e gerenciar questões
            </p>
          </Link>

          <Link
            href="/monitoring"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <h3 className="font-semibold mb-2">📊 Monitoramento</h3>
            <p className="text-sm text-gray-600">
              Ver logs e métricas do sistema
            </p>
          </Link>
        </div>
      </div>

      {/* Alertas */}
      {contestStats && contestStats.unprocessed > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">
                Concursos Pendentes
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Existem {contestStats.unprocessed} concursos com edital_url que
                ainda não foram processados.
              </p>
              <Link
                href="/content/batch-processing"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
              >
                Processar Agora
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
