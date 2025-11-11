import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { User, UserActivity, UserStats } from '../../types';
import { API_URL } from '../api';

export default function UserModal({ user, onClose, onChanged, token }: { user: User; onClose: ()=>void; onChanged: ()=>void; token: string; }) {
  const [tab, setTab] = useState<'info'|'stats'|'activity'>('info');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  // Token vem como prop da página principal

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([
          fetch(`${API_URL}/admin/users/${user.id}/stats`, { headers: { Authorization: `Bearer ${token}` }}).then(r=>r.json()),
          fetch(`${API_URL}/admin/users/${user.id}/activity`, { headers: { Authorization: `Bearer ${token}` }}).then(r=>r.json())
        ]);
        setStats(s);
        setActivity(a);
      } catch {
        toast.error('Erro ao carregar detalhes do usuário');
      }
    }
    load();
  }, [user.id]);

  async function ban() {
    const res = await fetch(`${API_URL}/admin/users/${user.id}/ban`, { method:'POST', headers: { Authorization: `Bearer ${token}` }});
    if (res.ok) { toast.success('Usuário banido'); onChanged(); } else toast.error('Falha ao banir');
  }
  async function unban() {
    const res = await fetch(`${API_URL}/admin/users/${user.id}/unban`, { method:'POST', headers: { Authorization: `Bearer ${token}` }});
    if (res.ok) { toast.success('Usuário desbanido'); onChanged(); } else toast.error('Falha ao desbanir');
  }
  async function addCash() {
    const amountStr = prompt('Quanto adicionar (R$)?', '10');
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;
    const res = await fetch(`${API_URL}/admin/users/${user.id}/add-cash`, {
      method:'POST',
      headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount })
    });
    if (res.ok) { toast.success('Créditos adicionados'); onChanged(); } else toast.error('Falha ao adicionar créditos');
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
        <div className="flex gap-2 mb-4 border-b pb-2">
          {(['info','stats','activity'] as const).map((t)=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-3 py-1 rounded-md ${tab===t?'bg-slate-800 text-white':'bg-slate-100 text-slate-700'}`}>
              {t==='info'?'Informações':t==='stats'?'Estatísticas':'Atividades'}
            </button>
          ))}
        </div>

        {tab==='info' && (
          <div className="space-y-3">
            <p><b>Email:</b> {user.email}</p>
            <p><b>Plano:</b> {user.plan || 'Free'}</p>
            <p><b>Créditos:</b> R$ {user.cash ?? 0}</p>
            <div className="flex gap-2 pt-2">
              {user.is_banned
                ? <button onClick={unban} className="px-3 py-2 bg-green-600 text-white rounded-md">Desbanir</button>
                : <button onClick={ban} className="px-3 py-2 bg-red-600 text-white rounded-md">Banir</button>}
              <button onClick={addCash} className="px-3 py-2 bg-slate-800 text-white rounded-md">Adicionar Créditos</button>
            </div>
          </div>
        )}

        {tab==='stats' && stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Decks" value={stats.decks} />
              <Stat label="Cartas" value={stats.cards} />
              <Stat label="Sessões" value={stats.sessions} />
              <Stat label="Streak Médio" value={stats.avg_streak} />
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.engagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cards" stroke="#2563eb" fill="#bfdbfe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab==='activity' && (
          <div className="space-y-2 max-h-64 overflow-auto">
            {activity.length===0 && <p className="text-slate-500">Sem atividades recentes.</p>}
            {activity.map((a)=>(
              <motion.div key={String(a.id)} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-400 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-slate-500">{a.created_at}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Stat({ label, value }:{ label:string; value:number|string }){
  return (
    <div className="p-3 bg-slate-50 rounded-lg text-center">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
