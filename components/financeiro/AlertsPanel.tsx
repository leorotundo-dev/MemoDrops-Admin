'use client';
export default function AlertsPanel({ items }:{ items: Array<any> }){
  if (!items || items.length===0) return null;
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Alertas</h3>
      <div className="space-y-2">
        {items.map((a)=>{
          return (
            <div key={a.id} className="p-3 rounded border bg-white">
              <div className="text-sm">
                <span className="font-semibold">{a.kind}</span> • {a.scope}{a.scope_key ? `:${a.scope_key}` : ''}
              </div>
              {a.details && <pre className="text-xs text-slate-600 overflow-auto">{JSON.stringify(a.details, null, 2)}</pre>}
              <div className="text-xs text-slate-500">{new Date(a.happened_at).toLocaleString('pt-BR')}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
