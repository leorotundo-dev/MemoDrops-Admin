'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function LimparBancoPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const limparBanco = async () => {
    if (!confirm('ATENÇÃO: Isso vai deletar TODOS os dados do banco! Tem certeza?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = (session as any)?.token;
      
      if (!token) {
        alert('Token não encontrado na sessão');
        return;
      }

      // Limpar tabelas
      const response = await fetch('https://memodrops-2-production.up.railway.app/admin/exec-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sql: 'TRUNCATE TABLE drops, subtopicos, topicos, materias, questoes, alternativas, concursos CASCADE;'
        })
      });

      const limpezaResult = await response.json();

      // Verificar contagem
      const countResponse = await fetch('https://memodrops-2-production.up.railway.app/admin/exec-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sql: `SELECT 'concursos' as tabela, COUNT(*) as registros FROM concursos
                UNION ALL SELECT 'materias', COUNT(*) FROM materias
                UNION ALL SELECT 'topicos', COUNT(*) FROM topicos
                UNION ALL SELECT 'subtopicos', COUNT(*) FROM subtopicos
                UNION ALL SELECT 'drops', COUNT(*) FROM drops
                UNION ALL SELECT 'questoes', COUNT(*) FROM questoes;`
        })
      });

      const countResult = await countResponse.json();

      setResult({ limpeza: limpezaResult, contagem: countResult });
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Limpar Banco de Dados</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
        <p className="text-yellow-800 font-semibold">⚠️ ATENÇÃO</p>
        <p className="text-yellow-700">
          Esta ação vai deletar TODOS os dados das seguintes tabelas:
        </p>
        <ul className="list-disc ml-6 mt-2 text-yellow-700">
          <li>concursos</li>
          <li>materias</li>
          <li>topicos</li>
          <li>subtopicos</li>
          <li>drops</li>
          <li>questoes</li>
          <li>alternativas</li>
        </ul>
      </div>

      <button
        onClick={limparBanco}
        disabled={loading}
        className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Limpando...' : 'Limpar Banco de Dados'}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Resultado:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
