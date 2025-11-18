"use client";

import React from "react";
import { DropListItem } from "@/app/(dashboard)/content/drops/page";

interface DropsTableProps {
  drops: DropListItem[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onSelectDrop: (id: string) => void;
  onToggleAprovado: (id: string, aprovado: boolean) => void;
  onDeleteDrop: (id: string) => void;
}

const dificuldadeColor: Record<
  DropListItem["dificuldade"],
  string
> = {
  facil: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medio: "bg-amber-50 text-amber-700 border-amber-200",
  dificil: "bg-rose-50 text-rose-700 border-rose-200",
};

export const DropsTable: React.FC<DropsTableProps> = ({
  drops,
  page,
  limit,
  total,
  onPageChange,
  onSelectDrop,
  onToggleAprovado,
  onDeleteDrop,
}) => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  if (!drops || drops.length === 0) {
    return (
      <div className="border rounded-md p-4 text-sm text-slate-500 bg-white">
        Nenhum Drop encontrado para os filtros atuais.
      </div>
    );
  }

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div className="border rounded-md bg-white shadow-sm">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left px-3 py-2 font-medium text-slate-700">
              Título
            </th>
            <th className="text-left px-3 py-2 font-medium text-slate-700">
              Hierarquia
            </th>
            <th className="text-left px-3 py-2 font-medium text-slate-700">
              Dificuldade
            </th>
            <th className="text-left px-3 py-2 font-medium text-slate-700">
              Tempo
            </th>
            <th className="text-left px-3 py-2 font-medium text-slate-700">
              Status
            </th>
            <th className="text-right px-3 py-2 font-medium text-slate-700">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {drops.map((d) => (
            <tr
              key={d.id}
              className="border-b last:border-b-0 hover:bg-slate-50"
            >
              <td className="px-3 py-2 align-top max-w-xs">
                <div className="font-medium text-slate-900 truncate">
                  {d.titulo}
                </div>
                <div className="text-[10px] text-slate-400">
                  Gerado em{" "}
                  {new Date(d.gerado_em).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </td>
              <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                <div>{d.materia_nome}</div>
                <div className="text-slate-500">{d.topico_nome}</div>
                <div className="text-slate-500 italic">
                  {d.subtopico_nome}
                </div>
              </td>
              <td className="px-3 py-2 align-top">
                <span
                  className={
                    "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] " +
                    dificuldadeColor[d.dificuldade]
                  }
                >
                  {d.dificuldade === "facil" && "Fácil"}
                  {d.dificuldade === "medio" && "Médio"}
                  {d.dificuldade === "dificil" && "Difícil"}
                </span>
              </td>
              <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                {d.tempo_estimado_minutos} min
              </td>
              <td className="px-3 py-2 align-top text-[11px]">
                {d.aprovado ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aprovado
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Pendente
                  </span>
                )}
              </td>
              <td className="px-3 py-2 align-top text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDrop(d.id)}
                    className="text-[11px] underline text-slate-700 hover:text-slate-900"
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleAprovado(d.id, !d.aprovado)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900"
                  >
                    {d.aprovado ? "Reprovar" : "Aprovar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDrop(d.id)}
                    className="text-[11px] text-red-600 hover:text-red-800"
                  >
                    Deletar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-3 py-2 border-t bg-slate-50 text-[11px] text-slate-600">
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={page <= 1}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={page >= totalPages}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};
