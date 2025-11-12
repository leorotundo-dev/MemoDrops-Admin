'use client';
import React, { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-5ffc.up.railway.app';

// Token hardcoded temporariamente para teste
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyYmZhOWRhOC01NmRiLTQyYWItOTczNi1lYTEzMjE2MzQ2YWEiLCJpYXQiOjE3NjI5MDYyNTEsImV4cCI6MTc2MzUxMTA1MX0.kQRvqPbshbAVq-WM7mq2qnZ7GSzD2KB6SDTNB7UvBis';

export default function UsersPageSimple() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        console.log('Fetching from:', `${API_URL}/admin/users`);
        const response = await fetch(`${API_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Data received:', data);
        
        setUsers(data.users || data.items || data || []);
      } catch (err: any) {
        console.error('Error loading users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Usuários (Teste Simples)</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Usuários (Teste Simples)</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Usuários (Teste Simples)</h1>
      <p className="mb-4">Total: {users.length} usuários</p>
      
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.plan}</td>
                <td className="px-6 py-4">R$ {user.cash || '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
