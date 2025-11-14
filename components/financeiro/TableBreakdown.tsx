'use client';
export default function TableBreakdown({ data }:{ data: Array<{ key:string; brl:number; events:number }> }){
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-2">Chave</th>
            <th className="text-right p-2">R$</th>
            <th className="text-right p-2">Eventos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d)=> (
            <tr key={d.key} className="border-b hover:bg-slate-50">
              <td className="p-2">{d.key}</td>
              <td className="p-2 text-right">{Number(d.brl).toFixed(2)}</td>
              <td className="p-2 text-right">{d.events}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
