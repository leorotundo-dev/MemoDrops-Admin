'use client';
export default function KPI({ label, value, prefix='' }:{ label:string; value:number; prefix?:string }){
  const fmt = (n:number)=> new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  return (
    <div className="kpi card p-4">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-2xl font-bold">{prefix} {fmt(value)}</div>
    </div>
  );
}
