import React from 'react';
import type { User } from '../../types';

export default function UserTable({ users, onSelect, loading }: { users: User[]; onSelect: (u: User)=>void; loading?: boolean; }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left text-sm font-semibold">Nome</th>
            <th className="px-3 py-2 text-left text-sm font-semibold">Email</th>
            <th className="px-3 py-2 text-sm">Plano</th>
            <th className="px-3 py-2 text-sm">Créditos</th>
            <th className="px-3 py-2 text-sm">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Carregando…</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
          ) : users.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50">
              <td className="px-3 py-2">{u.name}</td>
              <td className="px-3 py-2 text-slate-500">{u.email}</td>
              <td className="px-3 py-2">{u.plan || '—'}</td>
              <td className="px-3 py-2">{u.cash ?? 0}</td>
              <td className="px-3 py-2">{u.is_banned ? 'Banido' : 'Ativo'}</td>
              <td className="px-3 py-2 text-right">
                <button onClick={() => onSelect(u)} className="text-blue-600 hover:underline">
                  Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
