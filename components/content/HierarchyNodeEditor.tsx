"use client";

import React, { useState, useEffect } from "react";

type NodeType = "materia" | "topico" | "subtopico";

interface HierarchyNodeEditorProps {
  isOpen: boolean;
  tipo: NodeType;
  nomeAtual: string;
  onCancel: () => void;
  onSave: (novoNome: string) => void;
}

const LABELS: Record<NodeType, string> = {
  materia: "Matéria",
  topico: "Tópico",
  subtopico: "Subtópico",
};

export const HierarchyNodeEditor: React.FC<HierarchyNodeEditorProps> = ({
  isOpen,
  tipo,
  nomeAtual,
  onCancel,
  onSave,
}) => {
  const [nome, setNome] = useState(nomeAtual);

  useEffect(() => {
    setNome(nomeAtual);
  }, [nomeAtual]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("O nome não pode ser vazio.");
      return;
    }
    onSave(nome.trim());
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Editar {LABELS[tipo]}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Nome da {LABELS[tipo]}
            </label>
            <input
              type="text"
              className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs rounded bg-slate-900 text-white hover:bg-slate-800"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
