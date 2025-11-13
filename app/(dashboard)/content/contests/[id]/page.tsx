'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Contest = {
  id: string;
  name: string;
  slug: string;
  banca?: string;
  ano?: number;
  nivel?: string;
  data_prova?: string;
  salario?: number;
  numero_vagas?: number;
  orgao?: string;
  cidade?: string;
  estado?: string;
  edital_url?: string;
  informacoes_scraper?: any;
  materias?: Array<{ id: number; nome: string }>;
};

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;

    const fetchContest = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests/${params.id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const json = await res.json();
        setContest(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [token, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="space-y-4">
        <Link href="/content/contests" className="text-blue-600 hover:underline">
          ← Voltar para concursos
        </Link>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Concurso não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/content/contests" className="text-blue-600 hover:underline">
          ← Voltar para concursos
        </Link>
        <button className="btn btn-ghost" onClick={() => router.push(`/content/contests`)}>
          Editar
        </button>
      </div>

      {/* Título */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">{contest.name}</h1>
        <p className="text-gray-600">{contest.slug}</p>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contest.banca && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Banca Organizadora</p>
            <p className="font-semibold">{contest.banca}</p>
          </div>
        )}
        {contest.orgao && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Órgão</p>
            <p className="font-semibold">{contest.orgao}</p>
          </div>
        )}
        {contest.data_prova && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Data da Prova</p>
            <p className="font-semibold">{new Date(contest.data_prova).toLocaleDateString('pt-BR')}</p>
          </div>
        )}
        {contest.salario && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Salário</p>
            <p className="font-semibold">R$ {contest.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        )}
        {contest.numero_vagas && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Número de Vagas</p>
            <p className="font-semibold">{contest.numero_vagas}</p>
          </div>
        )}
        {contest.nivel && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Nível</p>
            <p className="font-semibold capitalize">{contest.nivel}</p>
          </div>
        )}
        {contest.cidade && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Localização</p>
            <p className="font-semibold">{contest.cidade} - {contest.estado}</p>
          </div>
        )}
        {contest.ano && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Ano</p>
            <p className="font-semibold">{contest.ano}</p>
          </div>
        )}
      </div>

      {/* Edital */}
      {contest.edital_url && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">📄 Edital</h2>
          <a 
            href={contest.edital_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {contest.edital_url}
          </a>
        </div>
      )}

      {/* Matérias */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📚 Matérias da Prova</h2>
        {contest.materias && contest.materias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {contest.materias.map((materia) => (
              <div key={materia.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="font-medium">{materia.nome}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhuma matéria cadastrada ainda</p>
        )}
      </div>

      {/* Informações do Scraper */}
      {contest.informacoes_scraper && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">🤖 Informações do Scraper</h2>
          <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(contest.informacoes_scraper, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
