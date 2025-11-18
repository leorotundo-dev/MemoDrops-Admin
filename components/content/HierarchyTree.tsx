"use client";

import React from "react";
import { Pencil, Trash2, CheckCircle2 } from "lucide-react";

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

type NodeType = "materia" | "topico" | "subtopico";

interface HierarchyTreeProps {
  materias: Materia[];
  onEdit: (tipo: NodeType, id: string, nomeAtual: string) => void;
  onDeleteSubtopico: (subtopicoId: string) => void;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  materias,
  onEdit,
  onDeleteSubtopico,
}) => {
  if (!materias || materias.length === 0) {
    return (
      <div className="border rounded-md p-4 text-sm text-slate-500">
        Nenhuma hierarquia encontrada para este concurso.
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 bg-white shadow-sm space-y-4">
      {materias.map((materia) => (
        <div key={materia.id} className="border rounded-md">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">
                Matéria: {materia.nome}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEdit("materia", materia.id, materia.nome)}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
          </div>

          <div className="p-3 space-y-3">
            {materia.topicos.length === 0 && (
              <p className="text-xs text-slate-400">
                Nenhum tópico cadastrado para esta matéria.
              </p>
            )}

            {materia.topicos.map((topico) => (
              <div key={topico.id} className="border rounded-md">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b">
                  <span className="text-xs font-medium text-slate-700">
                    Tópico: {topico.nome}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEdit("topico", topico.id, topico.nome)}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </button>
                </div>

                <div className="p-2 space-y-1">
                  {topico.subtopicos.length === 0 && (
                    <p className="text-xs text-slate-400 ml-3">
                      Nenhum subtópico cadastrado.
                    </p>
                  )}

                  {topico.subtopicos.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-2 px-3 py-1 rounded hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-700">
                          • {sub.nome}
                        </span>
                        {sub.hasDrop && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Drop gerado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit("subtopico", sub.id, sub.nome)
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900"
                        >
                          <Pencil className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSubtopico(sub.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
