"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type DropDetail = {
  id: string;
  titulo: string;
  conteudo: string;
  exemplo_pratico?: string;
  tecnicas_memorizacao?: string[];
  fontes?: { label: string; url: string }[];
  aprovado: boolean;
};

interface DropViewerProps {
  dropId: string;
  onClose: () => void;
  onAfterUpdate?: () => void;
  onAfterDelete?: (id: string) => void;
}

export const DropViewer: React.FC<DropViewerProps> = ({
  dropId,
  onClose,
  onAfterUpdate,
  onAfterDelete,
}) => {
  const [drop, setDrop] = useState<DropDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tituloEdit, setTituloEdit] = useState("");
  const [conteudoEdit, setConteudoEdit] = useState("");

  const loadDrop = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/admin/drops/${dropId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Erro ao carregar Drop: ${res.status}`);
      }
      const json = await res.json();
      setDrop(json);
      setTituloEdit(json.titulo);
      setConteudoEdit(json.conteudo);
    } catch (e: any) {
      alert(e?.message ?? "Erro ao carregar Drop");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dropId) loadDrop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropId]);

  const handleSave = async () => {
    if (!drop) return;
    try {
      setSaving(true);
      const res = await fetch(`/admin/drops/${drop.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: tituloEdit,
          conteudo: conteudoEdit,
          aprovado: drop.aprovado,
        }),
      });
      if (!res.ok) {
        throw new Error(`Erro ao salvar Drop: ${res.status}`);
      }
      const updated = await res.json();
      setDrop(updated);
      setEditing(false);
      if (onAfterUpdate) onAfterUpdate();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao salvar Drop");
    } finally {
      setSaving(false);
    }
  };

  const handleAprovar = async () => {
    if (!drop) return;
    try {
      setSaving(true);
      const res = await fetch(`/admin/drops/${drop.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aprovado: true,
          titulo: drop.titulo,
          conteudo: drop.conteudo,
        }),
      });
      if (!res.ok) {
        throw new Error(`Erro ao aprovar Drop: ${res.status}`);
      }
      const updated = await res.json();
      setDrop(updated);
      if (onAfterUpdate) onAfterUpdate();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao aprovar Drop");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!drop) return;
    const confirmar = window.confirm("Deseja realmente deletar este Drop?");
    if (!confirmar) return;
    try {
      const res = await fetch(`/admin/drops/${drop.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Erro ao deletar Drop: ${res.status}`);
      }
      if (onAfterDelete) onAfterDelete(drop.id);
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao deletar Drop");
    }
  };

  if (!dropId) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end bg-black/40">
      <div className="w-full max-w-2xl bg-white shadow-xl h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">
            {editing ? "Editar Drop" : "Visualizar Drop"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Fechar
          </button>
        </div>

        {loading && (
          <div className="p-4 text-xs text-slate-500">
            Carregando conteúdo do Drop...
          </div>
        )}

        {!loading && drop && (
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Título</label>
              {editing ? (
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={tituloEdit}
                  onChange={(e) => setTituloEdit(e.target.value)}
                />
              ) : (
                <div className="text-sm font-semibold">{drop.titulo}</div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">
                Conteúdo didático
              </label>
              {editing ? (
                <textarea
                  className="w-full border rounded px-2 py-1 text-xs h-64"
                  value={conteudoEdit}
                  onChange={(e) => setConteudoEdit(e.target.value)}
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{drop.conteudo}</ReactMarkdown>
                </div>
              )}
            </div>

            {drop.exemplo_pratico && (
              <div className="space-y-1">
                <h3 className="text-xs font-semibold">
                  Exemplo Prático
                </h3>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{drop.exemplo_pratico}</ReactMarkdown>
                </div>
              </div>
            )}

            {drop.tecnicas_memorizacao &&
              drop.tecnicas_memorizacao.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold">
                    Técnicas de Memorização
                  </h3>
                  <ul className="list-disc list-inside text-xs text-slate-700">
                    {drop.tecnicas_memorizacao.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

            {drop.fontes && drop.fontes.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-semibold">Fontes</h3>
                <ul className="text-xs text-slate-700 space-y-1">
                  {drop.fontes.map((f, idx) => (
                    <li key={idx}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline"
                      >
                        {f.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!loading && drop && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
            <div className="text-[11px] text-slate-500">
              Status:{" "}
              {drop.aprovado ? (
                <span className="text-emerald-700 font-medium">
                  Aprovado
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  Pendente
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!drop.aprovado && (
                <button
                  type="button"
                  onClick={handleAprovar}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Aprovar
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="px-3 py-1.5 text-xs rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                {editing ? "Cancelar edição" : "Editar"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !editing}
                className="px-3 py-1.5 text-xs rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700"
              >
                Deletar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
