import { sfetch } from "@/lib/sfetch";
import { AdminStats } from "@/types";

interface CostData {
  service: string;
  total_cost: number;
  category: string;
}

export default async function FinanceiroPage() {
  const stats = await sfetch("/admin/stats") as AdminStats | null;
  
  if (!stats || !stats.finance) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erro ao carregar dados financeiros. Verifique se o backend está rodando.
        </div>
      </div>
    );
  }

  // Transformar dados do /admin/stats para o formato esperado
  const aggregated: CostData[] = stats.finance?.costs_by_service?.map((item) => ({
    service: item.service,
    total_cost: item.total || 0,
    category: item.category
  })) || [];

  const total = stats.finance.total_cost || 0;
  const servicesCount = aggregated.length;
  const avgPerService = servicesCount > 0 ? total / servicesCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel Financeiro</h1>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Custo Total</div>
          <div className="text-3xl font-bold text-green-600">R$ {total.toFixed(2)}</div>
        </div>
        
        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Serviços Ativos</div>
          <div className="text-3xl font-bold">{servicesCount}</div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Média por Serviço</div>
          <div className="text-3xl font-bold">R$ {avgPerService.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Custos por Serviço</h2>
        </div>
        
        {aggregated.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhum dado de custo disponível ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Serviço</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-right p-3">Custo Total</th>
                  <th className="text-right p-3">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {aggregated.map((item, index) => {
                  const percentage = total > 0 
                    ? ((item.total_cost / total) * 100).toFixed(1)
                    : '0.0';
                  
                  return (
                    <tr key={index} className="border-t hover:bg-slate-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-medium capitalize">{item.service}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm capitalize text-slate-600">{item.category}</span>
                      </td>
                      <td className="p-3 text-right font-semibold">
                        R$ {item.total_cost.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td className="p-3" colSpan={2}>TOTAL</td>
                  <td className="p-3 text-right">R$ {total.toFixed(2)}</td>
                  <td className="p-3 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Gráfico de Distribuição */}
      {aggregated.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Distribuição de Custos</h2>
          <div className="space-y-3">
            {aggregated.map((item, index) => {
              const percentage = total > 0 
                ? (item.total_cost / total) * 100
                : 0;
              
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{item.service} <span className="text-slate-500">({item.category})</span></span>
                    <span className="text-slate-600">R$ {item.total_cost.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custos por Categoria */}
      {stats.finance.costs_by_category && Object.keys(stats.finance.costs_by_category).length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Custos por Categoria</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(stats.finance.costs_by_category).map(([category, cost]) => (
              <div key={category} className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600 capitalize mb-1">{category}</div>
                <div className="text-2xl font-bold">R$ {(cost as number).toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {total > 0 ? ((cost as number / total) * 100).toFixed(1) : '0'}% do total
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
