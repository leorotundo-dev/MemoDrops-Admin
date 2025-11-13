'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Banca {
  id: string;
  name: string;
  display_name: string;
  short_name: string;
  full_name: string;
  website_url: string;
  logo_url: string;
  description: string;
  areas: string[];
  is_active: boolean;
  total_contests: number;
  scraper_id: string | null;
  scraper_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Contest {
  id: string;
  name: string;
  slug: string;
  banca: string | null;
  ano: number | null;
  nivel: string | null;
  data_prova: string | null;
  salario: string | null;
  numero_vagas: number | null;
  created_at: string;
}

export default function BancaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [banca, setBanca] = useState<Banca | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBancaDetails();
    }
  }, [params.id]);

  const fetchBancaDetails = async () => {
    try {
      const res = await fetch(`/api/admin/bancas/${params.id}`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Falha ao carregar dados');
      
      const data = await res.json();
      setBanca(data);
      
      // Buscar concursos da banca
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-5ffc.up.railway.app';
      const contestsRes = await fetch(`${apiUrl}/bancas/${params.id}/contests`);
      if (contestsRes.ok) {
        const contestsData = await contestsRes.json();
        setContests(contestsData.contests || []);
      }
      
    } catch (error) {
      console.error('Erro ao carregar banca:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!banca) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">Banca não encontrada</p>
          <button
            onClick={() => router.push('/bancas')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para Bancas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/bancas')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Bancas
        </button>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {banca.logo_url && (
                <img
                  src={banca.logo_url}
                  alt={banca.display_name}
                  className="w-20 h-20 object-contain rounded"
                />
              )}
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-gray-900">{banca.display_name}</h1>
                  {banca.is_active ? (
                    <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ativa
                    </span>
                  ) : (
                    <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      <XCircle className="w-4 h-4 mr-1" />
                      Inativa
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  <span className="font-semibold">Sigla:</span> {banca.short_name || banca.name.toUpperCase()}
                </p>
                {banca.full_name && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Nome Completo:</span> {banca.full_name}
                  </p>
                )}
                {banca.website_url && (
                  <a
                    href={banca.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {banca.website_url}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Áreas */}
          {banca.areas && banca.areas.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Áreas de Atuação:</p>
              <div className="flex flex-wrap gap-2">
                {banca.areas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Descrição */}
          {banca.description && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Sobre:</p>
              <p className="text-gray-600 leading-relaxed">{banca.description}</p>
            </div>
          )}

          {/* Scraper */}
          {banca.scraper_name && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Scraper Associado:</span> {banca.scraper_name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Concursos</p>
              <p className="text-2xl font-bold text-gray-900">{banca.total_contests || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cadastrada em</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(banca.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Última Atualização</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(banca.updated_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Lista de Concursos */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Concursos</h2>
        
        {contests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum concurso cadastrado para esta banca</p>
            <p className="text-gray-400 text-sm mt-2">
              Os concursos aparecerão aqui quando forem adicionados ao sistema
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contests.map((contest) => (
              <div
                key={contest.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/content/contests/${contest.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{contest.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      Cadastrado em: {new Date(contest.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
