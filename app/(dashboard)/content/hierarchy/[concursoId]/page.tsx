"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { HierarchyTree } from "@/components/content/HierarchyTree";
import { HierarchyNodeEditor } from "@/components/content/HierarchyNodeEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-5ffc.up.railway.app';

type Subtopico = {
  id: string;
  nome: string;
  hasDrop?: boolean;
};

type Topico = {
  id: string;
  nome: string;
  subtopicos: Subtopico[];
};

type Materia = {
  id: string;
  nome: string;
  topicos: Topico[];
};

type HierarchyResponse = {
  concurso: {
    id: string;
    name: string;
  };
  materias: Materia[];
};

type NodeType = "materia" | "topico" | "subtopico";

type EditTarget = {
  tipo: NodeType;
  id: string;
  nomeAtual: string;
};

export default function HierarchyPage() {
  const params = useParams<{ concursoId: string }>();
  const concursoId = params.concursoId;
  const router = useRouter();

  const [data, setData] = useState<HierarchyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDrops, setLoadingDrops] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const loadHierarchy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/admin/concursos/${concursoId}/hierarchy`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Erro ao carregar hierarquia: ${res.status}`);
      }
      const json: HierarchyResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Erro desconhecido ao carregar hierarquia");
    } finally {
      setLoading(false);
    }
  }, [concursoId]);

  useEffect(() => {
    if (concursoId) {
      loadHierarchy();
    }
  }, [concursoId, loadHierarchy]);

  const handleOpenEditor = (tipo: NodeType, id: string, nomeAtual: string) => {
    setEditTarget({ tipo, id, nomeAtual });
  };

  const handleCloseEditor = () => {
    setEditTarget(null);
  };

  const handleSaveNode = async (novoNome: string) => {
    if (!editTarget) return;

    try {
      let endpoint = "";
      if (editTarget.tipo === "materia") {
        endpoint = `${API_URL}/admin/materias/${editTarget.id}`;
      } else if (editTarget.tipo === "topico") {
        endpoint = `${API_URL}/admin/topicos/${editTarget.id}`;
      } else {
        endpoint = `${API_URL}/admin/subtopicos/${editTarget.id}`;
      }

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome: novoNome }),
      });

      if (!res.ok) {
        throw new Error(`Erro ao salvar: ${res.status}`);
      }

      setEditTarget(null);
      await loadHierarchy();
    } catch (e: any) {
      alert(`Erro ao salvar: ${e?.message}`);
    }
  };

  const handleDeleteSubtopico = async (subtopicoId: string) => {
    if (!confirm("Tem certeza que deseja deletar este subtópico?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/subtopicos/${subtopicoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Erro ao deletar: ${res.status}`);
      }

      await loadHierarchy();
    } catch (e: any) {
      alert(`Erro ao deletar: ${e?.message}`);
    }
  };

  const handleGerarDropsLote = async () => {
    if (!confirm("Gerar drops em lote para este concurso?")) {
      return;
    }

    try {
      setLoadingDrops(true);
      const res = await fetch(`${API_URL}/admin/concursos/${concursoId}/gerar-drops-lote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          limite: 50,
          priorizar_por_incidencia: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro ao gerar drops: ${res.status}`);
      }

      const result = await res.json();
      alert(`Drops gerados com sucesso! ${result.subtopicos_processados} subtópicos processados.`);
      await loadHierarchy();
    } catch (e: any) {
      alert(`Erro ao gerar drops: ${e?.message}`);
    } finally {
      setLoadingDrops(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-slate-500">Carregando hierarquia...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-slate-500">Nenhum dado encontrado.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hierarquia: {data.concurso.name}
          </h1>
          <p className="text-sm text-slate-600">
            Gerencie matérias, tópicos e subtópicos
          </p>
        </div>
        <button
          onClick={handleGerarDropsLote}
          disabled={loadingDrops}
          className="px-4 py-2 text-sm rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loadingDrops ? "Gerando..." : "Gerar Drops em Lote"}
        </button>
      </div>

      <HierarchyTree
        materias={data.materias}
        onEdit={handleOpenEditor}
        onDeleteSubtopico={handleDeleteSubtopico}
      />

      <HierarchyNodeEditor
        isOpen={!!editTarget}
        tipo={editTarget?.tipo ?? "materia"}
        nomeAtual={editTarget?.nomeAtual ?? ""}
        onCancel={handleCloseEditor}
        onSave={handleSaveNode}
      />
    </div>
  );
}
