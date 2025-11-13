'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import HierarquiaTree from '@/components/hierarquia/HierarquiaTree';
import HierarquiaStats from '@/components/hierarquia/HierarquiaStats';

type Subtopico = {
  id: number;
  nome: string;
  slug: string;
  subsubtopicos?: Array<{
    id: number;
    nome: string;
    slug: string;
  }>;
};

type Topico = {
  id: number;
  nome: string;
  slug: string;
  subtopicos?: Subtopico[];
};

type Materia = {
  id: number;
  nome: string;
  slug: string;
  topicos?: Topico[];
};

type Hierarquia = {
  concurso: {
    id: string;
    name: string;
    banca: string;
  };
  materias: Materia[];
};

export default function MateriaDetailPage() {
  const params = useParams();
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [hierarquia, setHierarquia] = useState<Hierarquia | null>(null);
  const [materia, setMateria] = useState<Materia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id || !params.materiaId) return;

    const fetchHierarquia = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/api/concursos/${params.id}/hierarquia`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const json = await res.json();
        setHierarquia(json);
        
        // Encontrar a matéria específica
        const materiaEncontrada = json.materias?.find(
          (m: Materia) => m.id === parseInt(params.materiaId as string)
        );
        setMateria(materiaEncontrada || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarquia();
  }, [token, params.id, params.materiaId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando hierarquia...</p>
        </div>
      </div>
    );
  }

  if (!materia) {
    return (
      <div className="space-y-4">
        <Link href={`/content/contests/${params.id}`} className="text-blue-600 hover:underline">
          ← Voltar para o concurso
        </Link>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Matéria não encontrada</p>
          <p className="text-sm text-gray-500 mt-2">Consulte o edital para mais informações</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/content/contests" className="hover:text-blue-600">
          Concursos
        </Link>
        <span>→</span>
        <Link href={`/content/contests/${params.id}`} className="hover:text-blue-600">
          {hierarquia?.concurso?.name || 'Concurso'}
        </Link>
        <span>→</span>
        <span className="text-gray-900 font-medium">{materia.nome}</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">📚 {materia.nome}</h1>
          <Link 
            href={`/content/contests/${params.id}`}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            ← Voltar
          </Link>
        </div>
        <p className="text-blue-100">
          {hierarquia?.concurso?.name && `${hierarquia.concurso.name}`}
          {hierarquia?.concurso?.banca && ` • ${hierarquia.concurso.banca}`}
        </p>
      </div>

      {/* Estatísticas */}
      <HierarquiaStats materias={[materia]} />

      {/* Hierarquia */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📝 Conteúdo Programático</h2>
        <HierarquiaTree 
          materias={[materia]} 
          contestId={params.id as string}
          showMaterias={false}
        />
      </div>
    </div>
  );
}
