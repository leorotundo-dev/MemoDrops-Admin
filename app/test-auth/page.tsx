'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [apiTest, setApiTest] = useState<any>(null);

  useEffect(() => {
    fetch('/api/test-backend')
      .then(r => r.json())
      .then(data => setApiTest(data))
      .catch(err => setApiTest({ error: err.message }));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teste de Autenticação</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Status da Sessão NextAuth</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session exists:</strong> {session ? 'Sim' : 'Não'}</p>
          </div>
          <pre className="mt-4 bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Teste de Conexão com Backend</h2>
          {apiTest ? (
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          ) : (
            <p>Carregando...</p>
          )}
        </div>
      </div>
    </div>
  );
}
