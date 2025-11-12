'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import UserTable from './components/users/UserTable';
import UserFilters from './components/users/UserFilters';
import UserModal from './components/users/UserModal';
import UserStatsCard from './components/users/UserStatsCard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from './components/api';
import type { User } from './types';

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [plan, setPlan] = useState<'all' | 'free' | 'pro' | 'team'>('all');
  const [selected, setSelected] = useState<User | null>(null);

  async function load() {
    console.log('Session in load:', session);
    console.log('Token:', (session as any)?.token);
    if (!(session as any)?.token) {
      console.log('No token found, skipping load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = new URL('/api/admin/users', window.location.origin);
      if (q) url.searchParams.set('q', q);
      if (status !== 'all') url.searchParams.set('status', status);
      if (plan !== 'all') url.searchParams.set('plan', plan);
      
      const res = await fetch(url.toString(), {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!res.ok) throw new Error('Erro ao carregar usuários');
      const data = await res.json();
      setUsers(data.users || data.items || data || []);
    } catch (e: any) {
      toast.error(e.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    if ((session as any)?.token) {
      load(); 
    }
  }, [session]);
  
  useEffect(() => { 
    if ((session as any)?.token) {
      const t = setTimeout(load, 350); 
      return () => clearTimeout(t);
    }
  }, [q, status, plan]);

  if (!session) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Carregando sessão...</div>
      </div>
    );
  }

  const token = (session as any)?.token;
  
  if (!token) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro de Autenticação:</strong> Token não encontrado na sessão.
          <details className="mt-2">
            <summary className="cursor-pointer">Ver detalhes da sessão</summary>
            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Usuários</h1>
        <button 
          onClick={load} 
          className="px-3 py-2 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700 transition-colors"
        >
          Atualizar
        </button>
      </div>

      <UserStatsCard users={users} loading={loading} />
      <UserFilters 
        q={q} 
        onQ={setQ} 
        status={status} 
        onStatus={setStatus} 
        plan={plan} 
        onPlan={setPlan} 
      />
      <UserTable 
        loading={loading} 
        users={users} 
        onSelect={setSelected} 
      />

      {selected && (
        <UserModal 
          user={selected} 
          onClose={() => setSelected(null)} 
          onChanged={load}
          token={token}
        />
      )}
      
      <ToastContainer position="bottom-right" />
    </div>
  );
}
