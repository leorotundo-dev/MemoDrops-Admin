'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';

type Job = { id:string; name:string; status:string; attemptsMade?:number; failedReason?:string; timestamp?:string };
type Stats = { api_status?:string; db_status?:string; active_jobs?:number; failed_jobs?:number };

export default function MonitoringPage(){
  const { data } = useSession(); const token = (data as any)?.accessToken as string | undefined;
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<'failed'|'active'|'waiting'|'completed'>('failed');
  const { push } = useToast();

  const fetchStats = async ()=>{
    try{
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/stats`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const json = await res.json();
      setStats(json.system || json);
    }catch{}
  };
  const fetchJobs = async ()=>{
    try{
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/queues/jobs?status=${status}&limit=50`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) { setJobs([]); return; }
      const json = await res.json();
      setJobs(json.data || []);
    }catch{ setJobs([]); }
  };

  useEffect(()=>{ fetchStats(); },[token]);
  useEffect(()=>{ fetchJobs(); },[status, token]);

  const retryJob = async (id: string)=>{
    try{
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/admin/queues/jobs/${id}/retry`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok){ push('Job re-tentado', 'success'); fetchJobs(); } else { push('Falha ao re-tentar job', 'error'); }
    }catch{ push('Erro de rede', 'error'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Monitoramento</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="kpi"><div className="text-xs">API</div><div className="text-xl font-semibold">{stats?.api_status ?? "—"}</div></div>
        <div className="kpi"><div className="text-xs">Banco</div><div className="text-xl font-semibold">{stats?.db_status ?? "—"}</div></div>
        <div className="kpi"><div className="text-xs">Jobs ativos</div><div className="text-xl font-semibold">{stats?.active_jobs ?? "—"}</div></div>
        <div className="kpi"><div className="text-xs">Jobs falhados</div><div className="text-xl font-semibold">{stats?.failed_jobs ?? "—"}</div></div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Fila de jobs</div>
          <select className="input max-w-[200px]" value={status} onChange={e=> setStatus(e.target.value as any)}>
            <option value="failed">Falhados</option>
            <option value="active">Ativos</option>
            <option value="waiting">Aguardando</option>
            <option value="completed">Concluídos</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>ID</th><th>Nome</th><th>Status</th><th>Tentativas</th><th>Erro</th><th></th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td className="font-mono text-xs">{j.id}</td>
                  <td>{j.name}</td>
                  <td>{j.status}</td>
                  <td>{j.attemptsMade ?? 0}</td>
                  <td className="max-w-[380px] truncate" title={j.failedReason || ''}>{j.failedReason || '—'}</td>
                  <td className="text-right">
                    {status === 'failed' && <button className="btn btn-ghost" onClick={()=> retryJob(j.id)}>Re-tentar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
