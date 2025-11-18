"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DropsTable } from "@/components/content/DropsTable";
import { DropViewer } from "@/components/content/DropViewer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type DropListItem = {
  id: string;
  titulo: string;
  materia_nome: string;
  topico_nome: string;
  subtopico_nome: string;
  dificuldade: "facil" | "medio" | "dificil";
  tempo_estimado_minutos: number;
  aprovado: boolean;
  gerado_em: string;
};

type DropsResponse = {
  drops: DropListItem[];
  total: number;
  page: number;
  limit: number;
};

const dificuldadeOptions = [
  { value: "", label: "Todas" },
  { value: "facil", label: "Fácil" },
  { value: "medio", label: "Médio" },
  { value: "dificil", label: "Difícil" },
];

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "aprovado", label: "Aprovados" },
  { value: "pendente", label: "Pendentes" },
];

export default function DropsPage() {
  const [data, setData] = useState<DropsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [materiaFilter, setMateriaFilter] = useState("");
  const [dificuldadeFilter, setDificuldadeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);

  const loadDrops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (materiaFilter) params.set("materia", materiaFilter);
      if (dificuldadeFilter) params.set("dificuldade", dificuldadeFilter);
      if (statusFilter) params.set("aprovado", statusFilter);
      if (search) params.set("q", search);

      const res = await fetch(`${API_URL}/admin/drops?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Erro ao carregar drops: ${res.status}`);
      }
      const json: DropsResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Erro desconhecido ao carregar drops");
    } finally {
      setLoading(false);
    }
  }, [page, limit, materiaFilter, dificuldadeFilter, statusFilter, search]);

  useEffect(() => {
    loadDrops();
  }, [loadDrops]);

  const handleAprovadoChange = async (
    dropId: string,
    aprovado: boolean
  ) => {
    try {
      const res = await fetch(`${API_URL}/admin/drops/${dropId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aprovado }),
      });
      if (!res.ok) {
        throw new Error(`Erro ao atualizar Drop: ${res.status}`);
      }

      setData((prev) => {
        if (!prev) return prev;
        const clone: DropsResponse = JSON.parse(JSON.stringify(prev));
        clone.drops = clone.drops.map((d) =>
          d.id === dropId ? { ...d, aprovado } : d
        );
        return clone;
      });
    } catch (e: any) {
      alert(e?.message ?? "Erro ao atualizar Drop");
    }
  };

  const handleDeleteDrop = async (dropId: string) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja deletar este Drop?"
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/admin/drops/${dropId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Erro ao deletar Drop: ${res.status}`);
      }

      setData((prev) => {
        if (!prev) return prev;
        const clone: DropsResponse = JSON.parse(JSON.stringify(prev));
        clone.drops = clone.drops.filter((d) => d.id !== dropId);
        clone.total = Math.max(0, clone.total - 1);
        return clone;
      });

      if (selectedDropId === dropId) {
        setSelectedDropId(null);
      }
    } catch (e: any) {
      alert(e?.message ?? "Erro ao deletar Drop");
    }
  };

  const handleRefresh = () => {
    loadDrops();
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages =
    data && data.limit > 0 ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Gestão de Drops</h1>
          <p className="text-xs text-slate-500">
            Visualize, filtre e aprove Drops antes de liberar para os alunos.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">Matéria</label>
          <input
            type="text"
            placeholder="Nome da matéria"
            className="border rounded px-2 py-1 text-xs w-40"
            value={materiaFilter}
            onChange={(e) => setMateriaFilter(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">Dificuldade</label>
          <select
            className="border rounded px-2 py-1 text-xs w-32"
            value={dificuldadeFilter}
            onChange={(e) => setDificuldadeFilter(e.target.value)}
          >
            {dificuldadeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-600">Status</label>
          <select
            className="border rounded px-2 py-1 text-xs w-32"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-xs text-slate-600">Busca por título</label>
          <input
            type="text"
            placeholder="Buscar..."
            className="border rounded px-2 py-1 text-xs w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="px-3 py-1.5 text-xs rounded bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => {
            setPage(1);
            loadDrops();
          }}
        >
          Aplicar filtros
        </button>
      </div>

      {loading && (
        <p className="text-xs text-slate-500">Carregando Drops...</p>
      )}
      {error && (
        <p className="text-xs text-red-600">
          Erro ao carregar Drops: {error}
        </p>
      )}

      {data && (
        <>
          <DropsTable
            drops={data.drops}
            page={data.page}
            limit={data.limit}
            total={data.total}
            onPageChange={handleChangePage}
            onSelectDrop={setSelectedDropId}
            onToggleAprovado={handleAprovadoChange}
            onDeleteDrop={handleDeleteDrop}
          />

          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>
              Página {data.page} de {totalPages} — {data.total} Drops
            </span>
            <button
              onClick={handleRefresh}
              className="underline hover:text-slate-800"
            >
              Atualizar
            </button>
          </div>
        </>
      )}

      {selectedDropId && (
        <DropViewer
          dropId={selectedDropId}
          onClose={() => setSelectedDropId(null)}
          onAfterUpdate={handleRefresh}
          onAfterDelete={(deletedId) => {
            if (selectedDropId === deletedId) {
              setSelectedDropId(null);
            }
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
