import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { api, apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { RevenueVsCostChart } from "@/components/charts/RevenueVsCostChart";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FinancePage(){
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role || 'admin';
  if (role !== 'superadmin') redirect('/');

  const mrr = await apiGet("/admin/finance/mrr", session?.accessToken as string | undefined).catch(()=>null);
  const costs = await apiGet("/admin/finance/costs?limit=10", session?.accessToken as string | undefined).catch(()=>null);
  const plans = await apiGet("/admin/finance/plans", session?.accessToken as string | undefined).catch(()=>({ data: [] }));

  const series = mrr?.series || [
    { month: "Jul", revenue: 12000, cost: 5000 },
    { month: "Ago", revenue: 15000, cost: 7000 },
    { month: "Set", revenue: 17000, cost: 9000 },
    { month: "Out", revenue: 21000, cost: 11000 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Financeiro</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader>MRR</CardHeader><CardContent><div className="text-2xl font-semibold">R$ {mrr?.current_mrr?.toFixed?.(2) ?? "—"}</div></CardContent></Card>
        <Card><CardHeader>Crescimento</CardHeader><CardContent><div className="text-2xl font-semibold">{mrr?.growth_rate ? `${mrr.growth_rate.toFixed(2)}%` : "—"}</div></CardContent></Card>
        <Card><CardHeader>Custo total (30d)</CardHeader><CardContent><div className="text-2xl font-semibold">R$ {costs?.total_cost?.toFixed?.(2) ?? "—"}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>Receita vs Custo</CardHeader>
        <CardContent><RevenueVsCostChart data={series} /></CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Planos</div>
            <Link className="btn btn-primary" href="/finance/plans/new">Novo plano</Link>
          </div>
          <table className="table">
            <thead><tr><th>Nome</th><th>Preço</th><th>Limite IA</th><th></th></tr></thead>
            <tbody>
              {(plans?.data || []).map((p: any) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>R$ {p.price_monthly?.toFixed?.(2) ?? p.price_monthly}</td>
                  <td>{p.ai_limit ?? "—"}</td>
                  <td className="text-right"><Link className="btn btn-ghost" href={`/finance/plans/${p.id}`}>Editar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-4">
          <div className="font-medium mb-2">Últimos custos</div>
          <table className="table">
            <thead><tr><th>Serviço</th><th>Categoria</th><th>Valor</th><th>Data</th></tr></thead>
            <tbody>
              {(costs?.data || []).map((c: any) => (
                <tr key={c.id}><td>{c.service}</td><td>{c.category}</td><td>R$ {c.amount.toFixed(2)}</td><td>{c.date}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="pt-3"><Link className="btn btn-primary" href="/finance/costs/new">Registrar custo</Link></div>
        </div>
      </div>
    </div>
  )
}
