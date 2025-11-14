'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/DataTable';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

type Question = {
  id: string;
  numero: number;
  enunciado: string;
  tipo: string;
  concurso_name?: string;
  banca_name?: string;
  revisado: boolean;
  qualidade?: string;
  resposta_correta?: string;
};

type ClassificationModalProps = {
  open: boolean;
  onClose: () => void;
  questionId: string;
  token?: string;
  onSuccess: () => void;
};

function ClassificationModal({ open, onClose, questionId, token, onSuccess }: ClassificationModalProps) {
  const [materias, setMaterias] = useState<any[]>([]);
  const [topicos, setTopicos] = useState<any[]>([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedTopico, setSelectedTopico] = useState('');
  const [relevancia, setRelevancia] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (open && token) {
      // Buscar matérias
      fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/subjects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => setMaterias(data.subjects || []))
        .catch(console.error);
    }
  }, [open, token]);

  useEffect(() => {
    if (selectedMateria && token) {
      // Buscar tópicos da matéria
      fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/subjects/${selectedMateria}/topicos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => setTopicos(data.data || []))
        .catch(console.error);
    } else {
      setTopicos([]);
      setSelectedTopico('');
    }
  }, [selectedMateria, token]);

  const handleClassify = async () => {
    if (!selectedMateria) {
      push('Selecione uma matéria', 'error');
      return;
    }

    setLoading(true);
    try {
      // Atualizar questão com classificação
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/questoes/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          materias: [{
            materia_id: selectedMateria,
            topico_id: selectedTopico || null,
            relevancia: relevancia
          }]
        })
      });

      if (res.ok) {
        push('Questão classificada com sucesso!', 'success');
        onSuccess();
        onClose();
      } else {
        push('Erro ao classificar questão', 'error');
      }
    } catch (e) {
      push('Erro ao classificar questão', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Classificar Questão">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Matéria *
          </label>
          <select
            value={selectedMateria}
            onChange={(e) => setSelectedMateria(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma matéria</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tópico (opcional)
          </label>
          <select
            value={selectedTopico}
            onChange={(e) => setSelectedTopico(e.target.value)}
            disabled={!selectedMateria}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecione um tópico</option>
            {topicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relevância
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={relevancia}
            onChange={(e) => setRelevancia(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Valor entre 0 e 1 (1 = mais relevante)</p>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleClassify}
            disabled={loading || !selectedMateria}
          >
            {loading ? 'Classificando...' : 'Classificar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function QuestionsPage() {
  const { data } = useSession();
  const token = (data as any)?.token as string | undefined;
  const [items, setItems] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRevisado, setFilterRevisado] = useState<string>('');
  const [filterBanca, setFilterBanca] = useState<string>('');
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [classifying, setClassifying] = useState<Question | null>(null);
  const [reviewing, setReviewing] = useState<Question | null>(null);
  const [generating, setGenerating] = useState<Question | null>(null);
  const { push } = useToast();

  const fetchList = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterRevisado) params.append('revisado', filterRevisado);
      if (filterBanca) params.append('banca_id', filterBanca);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/questoes?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      const json = await res.json();
      setItems(json.data || []);
      setTotal(json.total || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) fetchList();
  }, [search, filterRevisado, filterBanca, offset, token]);

  const handleReview = async (qualidade: string) => {
    if (!reviewing) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/questoes/${reviewing.id}/revisar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ qualidade })
        }
      );

      if (res.ok) {
        push('Questão revisada com sucesso!', 'success');
        setReviewing(null);
        fetchList();
      } else {
        push('Erro ao revisar questão', 'error');
      }
    } catch (e) {
      push('Erro ao revisar questão', 'error');
    }
  };

  const handleGenerateCard = async () => {
    if (!generating) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/questoes/${generating.id}/gerar-card`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({})
        }
      );

      if (res.ok) {
        push('Card gerado com sucesso!', 'success');
        setGenerating(null);
      } else {
        push('Erro ao gerar card', 'error');
      }
    } catch (e) {
      push('Erro ao gerar card', 'error');
    }
  };

  const columns = useMemo<ColumnDef<Question>[]>(
    () => [
      {
        accessorKey: 'numero',
        header: 'Nº',
        cell: ({ row }) => <span className="font-mono">{row.original.numero}</span>
      },
      {
        accessorKey: 'enunciado',
        header: 'Enunciado',
        cell: ({ row }) => (
          <div className="max-w-md truncate" title={row.original.enunciado}>
            {row.original.enunciado}
          </div>
        )
      },
      {
        accessorKey: 'banca_name',
        header: 'Banca'
      },
      {
        accessorKey: 'concurso_name',
        header: 'Concurso',
        cell: ({ row }) => (
          <div className="max-w-xs truncate" title={row.original.concurso_name}>
            {row.original.concurso_name}
          </div>
        )
      },
      {
        accessorKey: 'revisado',
        header: 'Revisado',
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              row.original.revisado
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {row.original.revisado ? 'Sim' : 'Não'}
          </span>
        )
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setClassifying(row.original)}
              title="Classificar"
            >
              🏷️
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setReviewing(row.original)}
              title="Revisar"
            >
              ✓
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setGenerating(row.original)}
              title="Gerar Card"
            >
              📇
            </button>
          </div>
        ),
        enableSorting: false
      }
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestão de Questões</h1>
        <span className="text-sm text-gray-500">{total} questões no total</span>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <input
          className="input max-w-sm"
          placeholder="Buscar por enunciado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-xs"
          value={filterRevisado}
          onChange={(e) => setFilterRevisado(e.target.value)}
        >
          <option value="">Todas (revisadas e não revisadas)</option>
          <option value="true">Apenas revisadas</option>
          <option value="false">Apenas não revisadas</option>
        </select>
      </div>

      <DataTable columns={columns} data={items} />

      {/* Paginação */}
      <div className="flex justify-between items-center">
        <button
          className="btn btn-ghost"
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={offset === 0}
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-600">
          Mostrando {offset + 1} - {Math.min(offset + limit, total)} de {total}
        </span>
        <button
          className="btn btn-ghost"
          onClick={() => setOffset(offset + limit)}
          disabled={offset + limit >= total}
        >
          Próxima →
        </button>
      </div>

      {/* Modal de Classificação */}
      <ClassificationModal
        open={!!classifying}
        onClose={() => setClassifying(null)}
        questionId={classifying?.id || ''}
        token={token}
        onSuccess={fetchList}
      />

      {/* Modal de Revisão */}
      <Modal open={!!reviewing} onClose={() => setReviewing(null)} title="Revisar Questão">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Questão #{reviewing?.numero}</p>
            <p className="text-sm">{reviewing?.enunciado}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualidade da questão
            </label>
            <div className="flex gap-2">
              <button
                className="btn btn-sm bg-red-100 text-red-800 hover:bg-red-200"
                onClick={() => handleReview('baixa')}
              >
                Baixa
              </button>
              <button
                className="btn btn-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                onClick={() => handleReview('media')}
              >
                Média
              </button>
              <button
                className="btn btn-sm bg-green-100 text-green-800 hover:bg-green-200"
                onClick={() => handleReview('alta')}
              >
                Alta
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn btn-ghost" onClick={() => setReviewing(null)}>
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Gerar Card */}
      <Modal open={!!generating} onClose={() => setGenerating(null)} title="Gerar Flashcard">
        <div className="space-y-4">
          <p>Deseja gerar um flashcard para a questão #{generating?.numero}?</p>
          <div className="flex gap-2 justify-end">
            <button className="btn btn-ghost" onClick={() => setGenerating(null)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleGenerateCard}>
              Gerar Card
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
