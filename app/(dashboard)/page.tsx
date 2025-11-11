import { sfetch } from "@/lib/serverApi";
import { AdminStats } from "@/types";
import { UsersGrowthChart } from "@/components/charts/UsersGrowthChart";
import { RevenueVsCostChart } from "@/components/charts/RevenueVsCostChart";

export default async function DashboardHome() {
  const stats = await sfetch("/admin/stats") as AdminStats | null;
  
  // Se a API não retornar dados, mostrar valores padrão
  if (!stats || !stats.users || !stats.finance) {
    return (
      <div className="space-y-6">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Dashboard Administrativo</h2>
          <p className="text-slate-600">Aguardando conexão com a API do backend...</p>
          <p className="text-sm text-slate-500 mt-2">Verifique se o backend está rodando e os endpoints /admin/stats estão implementados.</p>
        </div>
      </div>
    );
  }
  
  const kpis = [
    { label: "Usuários", value: stats.users.total.toLocaleString() },
    { label: "DAU", value: stats.users.active_dau.toLocaleString() },
    { label: "MRR", value: `R$ ${stats.finance.mrr.toFixed(2)}` },
    { label: "Custo Total", value: `R$ ${stats.finance.total_cost.toFixed(2)}` }
  ];
  const userGrowth = Array.from({ length: 30 }).map((_, i) => ({ date: `${i+1}`, users: Math.max(0, stats.users.active_mau - (30 - i) * 5) }));
  const revCost = [
    { month: "Hoje", revenue: stats.finance.mrr/30, cost: stats.finance.total_cost/30 },
    { month: "Mês", revenue: stats.finance.mrr, cost: stats.finance.total_cost },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="kpi">
            <div className="text-sm text-slate-600">{k.label}</div>
            <div className="text-xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <UsersGrowthChart data={userGrowth} />
        <RevenueVsCostChart data={revCost} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">Status do Sistema</div>
          <ul className="text-sm space-y-1">
            <li>API: <span className="badge">{stats.system.api_status}</span></li>
            <li>DB: <span className="badge">{stats.system.db_status}</span></li>
            <li>Jobs ativos: <b>{stats.system.active_jobs}</b></li>
            <li>Jobs falhados: <b>{stats.system.failed_jobs}</b></li>
          </ul>
        </div>
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">Conteúdo</div>
          <ul className="text-sm space-y-1">
            <li>Concursos: <b>{stats.content.contests}</b></li>
            <li>Matérias: <b>{stats.content.subjects}</b></li>
            <li>Decks públicos: <b>{stats.content.public_decks}</b></li>
            <li>Cards públicos: <b>{stats.content.public_cards}</b></li>
          </ul>
        </div>
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">Ações rápidas</div>
          <div className="space-x-2">
            <a className="btn btn-primary" href="/content/contests">Gerenciar Concursos</a>
            <a className="btn" href="/users">Usuários</a>
          </div>
        </div>
      </div>

      {/* Detalhamento de Custos */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Detalhamento de Custos (Últimos 30 dias)</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Custos por Categoria */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Por Categoria</h3>
            <div className="space-y-2">
              {stats.finance.costs_by_category && Object.keys(stats.finance.costs_by_category).length > 0 ? (
                Object.entries(stats.finance.costs_by_category).map(([category, total]) => (
                  <div key={category} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-sm capitalize">{category}</span>
                    <span className="font-semibold">R$ {(total as number).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">Nenhum custo registrado</div>
              )}
            </div>
          </div>

          {/* Custos por Serviço */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Por Serviço</h3>
            <div className="space-y-2">
              {stats.finance.costs_by_service && stats.finance.costs_by_service.length > 0 ? (
                stats.finance.costs_by_service.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <div>
                      <div className="text-sm font-medium">{item.service}</div>
                      <div className="text-xs text-slate-500 capitalize">{item.category}</div>
                    </div>
                    <span className="font-semibold">R$ {item.total.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">Nenhum custo registrado</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Os custos são rastreados automaticamente a partir da tabela <code className="bg-blue-100 px-1 rounded">api_costs</code> no banco de dados. 
            Para adicionar novos custos, insira registros nessa tabela com os campos: service, category, amount, period_start, period_end.
          </p>
        </div>
      </div>
    </div>
  );
}
