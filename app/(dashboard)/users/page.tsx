'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type User = { 
  id: string; 
  email: string; 
  name?: string; 
  plan?: string; 
  cash_balance?: number; 
  created_at?: string; 
};

export default function UsersPage() {
  const { data: session } = useSession();
  const token = (session as any)?.token as string | undefined;
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-5ffc.up.railway.app';
        const url = `${apiUrl}/admin/users`;
        
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        setItems(json.data || []);
        setError(null);
      } catch (e: any) {
        console.error('Error fetching users:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Usuários</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Usuários</h1>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <p className="font-semibold">Erro ao carregar usuários:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              items.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">{user.name || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {user.plan || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">R$ {(user.cash_balance || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{user.created_at?.slice(0, 10) || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
