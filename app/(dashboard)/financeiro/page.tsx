'use client';
import { useMemo, useEffect, useState } from 'react';
import KPI from '@/components/financeiro/KPI';
import AreaSeries from '@/components/financeiro/AreaSeries';
import BarStack from '@/components/financeiro/BarStack';
import AlertsPanel from '@/components/financeiro/AlertsPanel';
import TableBreakdown from '@/components/financeiro/TableBreakdown';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function FinanceiroPage(){
  const [env, setEnv] = useState<'prod'|'stg'|'dev'>('prod');
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<{ total_brl:number, series:Array<{dt:string, brl:number}> }|null>(null);
  const [breakdown, setBreakdown] = useState<Array<{ key:string, brl:number, events:number }>>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const { from, to } = useMemo(()=>{
    const to = new Date(); const from = new Date();
    if (period==='7d') from.setDate(to.getDate()-7);
    if (period==='30d') from.setDate(to.getDate()-30);
    if (period==='90d') from.setDate(to.getDate()-90);
    const f = from.toISOString().slice(0,10);
    const t = to.toISOString().slice(0,10);
    return { from:f, to:t };
  },[period]);

  async function fetchAll(){
    setLoading(true);
    try{
      const qp = (o:any)=> new URLSearchParams(o).toString();
      const [ov, br, al] = await Promise.all([
        fetch(`${API}/admin/costs/overview?${qp({ env, from, to })}`).then(r=>r.json()),
        fetch(`${API}/admin/costs/breakdown?${qp({ env, from, to, group:'feature' })}`).then(r=>r.json()),
        fetch(`${API}/admin/costs/alerts`).then(r=>r.json()),
      ]);
      // Converter strings para numbers
      if (ov?.total_brl) ov.total_brl = Number(ov.total_brl);
      if (ov?.series) ov.series = ov.series.map((s:any) => ({ ...s, brl: Number(s.brl) }));
      if (br) br = br.map((b:any) => ({ ...b, brl: Number(b.brl), events: Number(b.events) }));
      setKpi(ov); setBreakdown(br); setAlerts(al);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ fetchAll(); },[env, period]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <div className="flex gap-2">
          <select className="border rounded px-3 py-2" value={env} onChange={e=>setEnv(e.target.value as any)}>
            <option value="prod">prod</option>
            <option value="stg">stg</option>
            <option value="dev">dev</option>
          </select>
          <select className="border rounded px-3 py-2" value={period} onChange={e=>setPeriod(e.target.value as any)}>
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <KPI label="Custo total" value={kpi?.total_brl ?? 0} prefix="R$" />
        <KPI label="Burn (média diária)" value={useMemo(()=>{
          const s = kpi?.series || []; if (s.length===0) return 0;
          const sum = s.reduce((acc,x)=>acc+(Number(x.brl)||0),0);
          return Number((sum / s.length).toFixed(2));
        },[kpi])} prefix="R$" />
        <KPI label="Forecast fim do mês" value={useMemo(()=>{
          const s = kpi?.series || []; if (s.length===0) return 0;
          const sum = s.reduce((acc,x)=>acc+(Number(x.brl)||0),0);
          const avg = sum / s.length;
          const today = new Date(); const lastDay = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
          const day = today.getDate();
          const proj = avg * lastDay;
          return Number(proj.toFixed(2));
        },[kpi])} prefix="R$" />
      </div>

      {/* Series */}
      <div className="card p-4">
        <AreaSeries data={kpi?.series || []} />
      </div>

      {/* Breakdown por feature */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Custo por Feature</h3>
          <BarStack data={breakdown} />
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Detalhe</h3>
          <TableBreakdown data={breakdown} />
        </div>
      </div>

      {/* Alertas */}
      <AlertsPanel items={alerts} />
    </div>
  );
}
