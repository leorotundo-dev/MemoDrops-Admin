'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Materia = {
  id: number;
  nome: string;
  topicos?: Array<{
    id: number;
    nome: string;
    subtopicos?: Array<{ id: number; nome: string }>;
  }>;
};

type Drop = {
  id: number;
  titulo: string;
  conteudo: string;
  subtopico_id: number;
  created_at: string;
};

type Contest = {
  id: string;
  name: string;
  slug: string;
  banca?: string;
  ano?: number;
  nivel?: string;
  status?: string;
  data_prova?: string;
  data_inscricao_inicio?: string;
  data_inscricao_fim?: string;
  data_resultado?: string;
  salario?: number;
  salario_max?: number;
  numero_vagas?: number;
  orgao?: string;
  cidade?: string;
  estado?: string;
  edital_url?: string;
  site_oficial_url?: string;
  inscricoes_url?: string;
  informacoes_scraper?: any;
  materias?: Materia[];
  drops?: Drop[];
  stats?: {
    total_materias: number;
    total_topicos: number;
    total_subtopicos: number;
    total_drops: number;
    total_questoes: number;
  };
};

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingHierarchy, setProcessingHierarchy] = useState(false);
  const [generatingDrops, setGeneratingDrops] = useState(false);

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

  const handleProcessHierarchy = async () => {
    if (!token || !contest?.edital_url) return;
    
    setProcessingHierarchy(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/contests/${params.id}/processar-hierarquia`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (res.ok) {
        alert('Hierarquia processada com sucesso!');
        window.location.reload();
      } else {
        const error = await res.json();
        alert(`Erro ao processar hierarquia: ${error.message || 'Erro desconhecido'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao processar hierarquia');
    } finally {
      setProcessingHierarchy(false);
    }
  };

  const handleGenerateDrops = async () => {
    if (!token) return;
    
    const confirmGenerate = confirm(
      'Deseja gerar drops em lote para todos os subtópicos deste concurso? Esta operação pode levar alguns minutos.'
    );
    
    if (!confirmGenerate) return;
    
    setGeneratingDrops(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/concursos/${params.id}/gerar-drops-lote`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (res.ok) {
        const result = await res.json();
        alert(`Drops gerados com sucesso! Total: ${result.data?.total || 0}`);
        window.location.reload();
      } else {
        const error = await res.json();
        alert(`Erro ao gerar drops: ${error.message || 'Erro desconhecido'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar drops');
    } finally {
      setGeneratingDrops(false);
    }
  };

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

  const totalMaterias = contest.stats?.total_materias || contest.materias?.length || 0;
  const totalTopicos = contest.stats?.total_topicos || 0;
  const totalSubtopicos = contest.stats?.total_subtopicos || 0;
  const totalDrops = contest.stats?.total_drops || contest.drops?.length || 0;

  return (
    <div className="space-y-6">
      {/* ========== 1. CABEÇALHO ========== */}
      <div className="flex items-center justify-between">
        <Link href="/content/contests" className="text-blue-600 hover:underline">
          ← Voltar para concursos
        </Link>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Editar
          </button>
          <button className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
            Excluir
          </button>
        </div>
      </div>

      {/* Título e Banca */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-2">{contest.name}</h1>
        <p className="text-gray-500 mb-3">{contest.slug}</p>
        {contest.banca && (
          <p className="text-sm">
            <span className="text-gray-600">Banca Organizadora:</span>{' '}
            <span className="font-semibold">{contest.banca}</span>
          </p>
        )}
      </div>

      {/* ========== 2. INFORMAÇÕES BÁSICAS ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          📄 Informações Básicas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium">{contest.status || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Ano:</span>
            <span className="font-medium">{contest.ano || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Nível:</span>
            <span className="font-medium capitalize">{contest.nivel || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Órgão:</span>
            <span className="font-medium">{contest.orgao || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Estado:</span>
            <span className="font-medium">{contest.estado || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Cidade:</span>
            <span className="font-medium">{contest.cidade || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total de Vagas:</span>
            <span className="font-medium">{contest.numero_vagas || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Salário:</span>
            <span className="font-medium">
              {contest.salario
                ? `R$ ${contest.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${
                    contest.salario_max ? ` a R$ ${contest.salario_max.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''
                  }`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ========== 3. DATAS IMPORTANTES ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          📅 Datas Importantes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Inscrições:</span>
            <span className="font-medium">
              {contest.data_inscricao_inicio && contest.data_inscricao_fim
                ? `${new Date(contest.data_inscricao_inicio).toLocaleDateString('pt-BR')} a ${new Date(contest.data_inscricao_fim).toLocaleDateString('pt-BR')}`
                : '—'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Prova:</span>
            <span className="font-medium">
              {contest.data_prova ? new Date(contest.data_prova).toLocaleDateString('pt-BR') : '—'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Resultado:</span>
            <span className="font-medium">
              {contest.data_resultado ? new Date(contest.data_resultado).toLocaleDateString('pt-BR') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ========== 4. DOCUMENTOS E LINKS ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🔗 Documentos e Links
        </h2>
        <div className="space-y-3">
          {contest.edital_url && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Edital:</span>
              <a
                href={contest.edital_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                📄 Baixar edital (PDF)
              </a>
            </div>
          )}
          {contest.site_oficial_url && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Site oficial:</span>
              <a
                href={contest.site_oficial_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                🌐 Acessar site
              </a>
            </div>
          )}
          {contest.inscricoes_url && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Inscrições:</span>
              <a
                href={contest.inscricoes_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                🌐 Fazer inscrição
              </a>
            </div>
          )}
          {!contest.edital_url && !contest.site_oficial_url && !contest.inscricoes_url && (
            <p className="text-gray-500 text-sm">Nenhum documento ou link disponível ainda.</p>
          )}
        </div>
      </div>

      {/* ========== 5. CARGOS E VAGAS ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          💼 Cargos e Vagas
        </h2>
        <p className="text-gray-500 text-sm">
          Nenhuma informação de cargos disponível ainda.
        </p>
        {/* TODO: Implementar tabela de cargos quando houver dados */}
      </div>

      {/* ========== 6. MATÉRIAS DA PROVA ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          📚 Matérias da Prova
        </h2>
        
        {contest.materias && contest.materias.length > 0 ? (
          <div className="space-y-4">
            {contest.materias.map((materia) => {
              const numTopicos = materia.topicos?.length || 0;
              const numSubtopicos = materia.topicos?.reduce((acc, t) => acc + (t.subtopicos?.length || 0), 0) || 0;
              
              return (
                <div key={materia.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <Link href={`/content/contests/${params.id}/materias/${materia.id}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{materia.nome}</h3>
                        <p className="text-sm text-gray-600">
                          {numTopicos > 0 ? `${numTopicos} tópicos` : 'Sem tópicos'}{' '}
                          {numSubtopicos > 0 && `• ${numSubtopicos} subtópicos`}
                        </p>
                      </div>
                      <span className="text-blue-600">→</span>
                    </div>
                  </Link>
                </div>
              );
            })}
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Total: {totalMaterias} matérias • {totalTopicos} tópicos • {totalSubtopicos} subtópicos
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhuma matéria cadastrada ainda.</p>
            {contest.edital_url && (
              <button
                onClick={handleProcessHierarchy}
                disabled={processingHierarchy}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processingHierarchy ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando edital...
                  </span>
                ) : (
                  '📄 Processar Hierarquia do Edital'
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========== 7. DROPS GERADOS ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          💡 Drops Educacionais
        </h2>
        
        {totalDrops > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalDrops}</p>
                <p className="text-sm text-gray-600">drops gerados</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateDrops}
                  disabled={generatingDrops || totalSubtopicos === 0}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {generatingDrops ? 'Gerando...' : 'Gerar Mais Drops'}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Ver Todos os Drops
                </button>
              </div>
            </div>
            
            {contest.drops && contest.drops.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Drops recentes:</h3>
                <ul className="space-y-2">
                  {contest.drops.slice(0, 5).map((drop) => (
                    <li key={drop.id} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600">•</span>
                      <div className="flex-1">
                        <p className="font-medium">{drop.titulo}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(drop.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum drop gerado ainda.</p>
            {totalSubtopicos > 0 ? (
              <button
                onClick={handleGenerateDrops}
                disabled={generatingDrops}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {generatingDrops ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Gerando drops...
                  </span>
                ) : (
                  '💡 Gerar Drops em Lote'
                )}
              </button>
            ) : (
              <p className="text-sm text-gray-400">
                Processe a hierarquia do edital primeiro para gerar drops.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ========== 8. QUESTÕES DE PROVAS ANTERIORES ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          📝 Questões de Provas Anteriores
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Nenhuma questão cadastrada ainda.</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            📤 Upload de PDF
          </button>
        </div>
      </div>

      {/* ========== 9. ESTATÍSTICAS ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          📊 Estatísticas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-800">—</p>
            <p className="text-sm text-gray-600">Usuários estudando</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-800">—</p>
            <p className="text-sm text-gray-600">Drops visualizados</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-800">—</p>
            <p className="text-sm text-gray-600">Questões respondidas</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-800">—</p>
            <p className="text-sm text-gray-600">Taxa de acerto</p>
          </div>
        </div>
      </div>

      {/* ========== 10. INFORMAÇÕES DO SCRAPER ========== */}
      {contest.informacoes_scraper && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🤖 Informações do Scraper
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Ativo</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <details>
                <summary className="cursor-pointer font-medium text-sm text-gray-700 hover:text-gray-900">
                  Ver dados completos do scraper
                </summary>
                <pre className="mt-3 text-xs overflow-x-auto">
                  {JSON.stringify(contest.informacoes_scraper, null, 2)}
                </pre>
              </details>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                🔄 Atualizar Agora
              </button>
              <button className="px-4 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50">
                📋 Ver Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
