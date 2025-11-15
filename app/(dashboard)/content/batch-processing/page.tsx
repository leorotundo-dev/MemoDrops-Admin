'use client';
import { BatchProcessor } from '@/components/content/BatchProcessor';

export default function BatchProcessingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Processamento em Lote</h1>
        <p className="text-gray-600 mt-2">
          Processe automaticamente todos os concursos que têm edital_url mas ainda não foram processados.
        </p>
      </div>

      <BatchProcessor />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Como funciona</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• O sistema processa cada concurso sequencialmente</li>
          <li>• Cada processamento extrai matérias, tópicos e subtópicos do PDF</li>
          <li>• Há um delay de 2 segundos entre cada concurso</li>
          <li>• O progresso é atualizado em tempo real</li>
          <li>• Você pode acompanhar sucessos e falhas na lista de resultados</li>
        </ul>
      </div>
    </div>
  );
}
