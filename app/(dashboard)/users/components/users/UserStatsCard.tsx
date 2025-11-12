import React from 'react';
import type { User } from '../../types';

export default function UserStatsCard({ users, loading }: { users: User[]; loading?: boolean; }) {
  const total = users.length;
  const banned = users.filter(u=>u.is_banned).length;
  const active = total - banned;
  const revenue = users.reduce((a,u)=>a+(parseFloat(String(u.cash||0))),0);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label:'Total', value: total, tone:'bg-blue-50' },
        { label:'Ativos', value: active, tone:'bg-green-50' },
        { label:'Banidos', value: banned, tone:'bg-red-50' },
        { label:'Receita', value: `R$ ${Number(revenue).toFixed(2)}`, tone:'bg-yellow-50' },
      ].map((k)=> (
        <div key={k.label} className={`p-3 ${k.tone} rounded-lg text-center`}>
          <p className="text-sm text-slate-500">{k.label}</p>
          <p className="text-xl font-semibold">{loading? '…' : k.value}</p>
        </div>
      ))}
    </div>
  );
}
