'use client';
export default function BarStack({ data }:{ data: Array<{ key:string; brl:number; events:number }> }){
  return (
    <div className="space-y-2">
      {data.map((d)=>{
        const pct = Math.min(100, Math.round((Number(d.brl) / (Number(data[0]?.brl) || 1)) * 100));
        return (
          <div key={d.key}>
            <div className="flex justify-between text-sm mb-1">
              <div className="font-medium">{d.key}</div>
              <div className="text-slate-600">R$ {Number(d.brl).toFixed(2)} • {d.events} ev</div>
            </div>
            <div className="h-2 bg-slate-100 rounded">
              <div className="h-2 rounded" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
