import React from 'react';

export default function UserFilters({
  q, onQ, status, onStatus, plan, onPlan
}: {
  q: string; onQ: (v:string)=>void;
  status: 'all'|'active'|'banned'; onStatus: (v:any)=>void;
  plan: 'all'|'free'|'pro'|'team'; onPlan: (v:any)=>void;
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        value={q}
        onChange={(e)=>onQ(e.target.value)}
        type="search"
        placeholder="Buscar por nome ou email…"
        className="border rounded-md px-3 py-2 w-full md:w-1/3"
      />
      <select value={status} onChange={(e)=>onStatus(e.target.value as any)} className="border rounded-md px-3 py-2">
        <option value="all">Todos</option>
        <option value="active">Ativos</option>
        <option value="banned">Banidos</option>
      </select>
      <select value={plan} onChange={(e)=>onPlan(e.target.value as any)} className="border rounded-md px-3 py-2">
        <option value="all">Todos os Planos</option>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="team">Team</option>
      </select>
    </div>
  );
}
