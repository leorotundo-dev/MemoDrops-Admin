'use client';
import { useState } from 'react';

type Subsubtopico = {
  id: number;
  nome: string;
  slug: string;
};

type Subtopico = {
  id: number;
  nome: string;
  slug: string;
  subsubtopicos?: Subsubtopico[];
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

type HierarquiaTreeProps = {
  materias: Materia[];
  contestId: string;
  showMaterias?: boolean;
};

export default function HierarquiaTree({ 
  materias, 
  contestId,
  showMaterias = true 
}: HierarquiaTreeProps) {
  const [expandedTopicos, setExpandedTopicos] = useState<Set<number>>(new Set());
  const [expandedSubtopicos, setExpandedSubtopicos] = useState<Set<number>>(new Set());

  const toggleTopico = (topicoId: number) => {
    const newExpanded = new Set(expandedTopicos);
    if (newExpanded.has(topicoId)) {
      newExpanded.delete(topicoId);
    } else {
      newExpanded.add(topicoId);
    }
    setExpandedTopicos(newExpanded);
  };

  const toggleSubtopico = (subtopicoId: number) => {
    const newExpanded = new Set(expandedSubtopicos);
    if (newExpanded.has(subtopicoId)) {
      newExpanded.delete(subtopicoId);
    } else {
      newExpanded.add(subtopicoId);
    }
    setExpandedSubtopicos(newExpanded);
  };

  if (!materias || materias.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>Nenhuma matéria cadastrada</p>
        <p className="text-sm mt-2">Consulte o edital para mais informações</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materias.map((materia) => (
        <div key={materia.id} className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Matéria Header */}
          {showMaterias && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-200">
              <h3 className="font-bold text-lg text-blue-900">📚 {materia.nome}</h3>
              <p className="text-sm text-blue-700 mt-1">
                {materia.topicos?.length || 0} tópico(s)
              </p>
            </div>
          )}

          {/* Tópicos */}
          <div className="p-4 space-y-3">
            {materia.topicos && materia.topicos.length > 0 ? (
              materia.topicos.map((topico) => (
                <div key={topico.id} className="border border-slate-200 rounded-lg">
                  {/* Tópico Header */}
                  <button
                    onClick={() => toggleTopico(topico.id)}
                    className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-medium">
                        {expandedTopicos.has(topico.id) ? '▼' : '▶'}
                      </span>
                      <span className="font-semibold">{topico.nome}</span>
                    </div>
                    {topico.subtopicos && topico.subtopicos.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {topico.subtopicos.length} subtópico(s)
                      </span>
                    )}
                  </button>

                  {/* Subtópicos (expandido) */}
                  {expandedTopicos.has(topico.id) && topico.subtopicos && topico.subtopicos.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50 p-3 space-y-2">
                      {topico.subtopicos.map((subtopico) => (
                        <div key={subtopico.id} className="bg-white rounded border border-slate-200">
                          {/* Subtópico Header */}
                          <button
                            onClick={() => toggleSubtopico(subtopico.id)}
                            className="w-full text-left p-2 hover:bg-slate-50 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 text-sm">
                                {expandedSubtopicos.has(subtopico.id) ? '▼' : '▶'}
                              </span>
                              <span className="font-medium text-sm">{subtopico.nome}</span>
                            </div>
                            {subtopico.subsubtopicos && subtopico.subsubtopicos.length > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {subtopico.subsubtopicos.length}
                              </span>
                            )}
                          </button>

                          {/* Sub-subtópicos (expandido) */}
                          {expandedSubtopicos.has(subtopico.id) && 
                           subtopico.subsubtopicos && 
                           subtopico.subsubtopicos.length > 0 && (
                            <div className="border-t border-slate-200 bg-slate-50 p-2 space-y-1">
                              {subtopico.subsubtopicos.map((subsubtopico) => (
                                <div 
                                  key={subsubtopico.id} 
                                  className="text-sm text-gray-700 pl-6 py-1 flex items-center gap-2"
                                >
                                  <span className="text-purple-600">•</span>
                                  {subsubtopico.nome}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">
                Nenhum tópico cadastrado para esta matéria
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
