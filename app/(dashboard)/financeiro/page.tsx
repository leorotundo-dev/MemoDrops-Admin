'use client';
import { useState, useEffect } from 'react';

interface CostData {
  service: string;
  total_cost: number;
  total_tokens: number;
  total_requests: number;
}

interface FinanceData {
  message: string;
  aggregated: CostData[];
  total: number;
}

export default function FinanceiroPage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  async function fetchFinanceData() {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`);
      if (!response.ok) throw new Error('Erro ao carregar dados');
      
      const stats = await response.json();
      
      // Transformar dados do /admin/stats para o formato esperado
      const aggregated = stats.finance?.costs_by_service?.map((item: any) => ({
        service: item.service,
        total_cost: item.total || 0,
        total_tokens: 0, // Não disponível no /admin/stats
        total_requests: 0 // Não disponível no /admin/stats
      })) || [];

      setData({
        message: 'Success',
        aggregated,
        total: stats.finance?.total_cost || 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erro ao carregar dados financeiros: {error}
        </div>
      </div>
    );
  }

  const total = data?.total?.toFixed(2) || '0.00';
  const aggregated = data?.aggregated || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel Financeiro</h1>
        <button 
          onClick={fetchFinanceData}
          className="btn"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="kpi">
          <div className="text-sm text-slate-600">Custo Total</div>
          <div className="text-3xl font-bold text-green-600">R$ {total}</div>
        </div>
        
        <div className="kpi">
          <div className="text-sm text-slate-600">Serviços Ativos</div>
          <div className="text-3xl font-bold">{aggregated.length}</div>
        </div>

        <div className="kpi">
          <div className="text-sm text-slate-600">Média por Serviço</div>
          <div className="text-3xl font-bold">
            R$ {aggregated.length > 0 ? (data!.total / aggregated.length).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Tabela de Custos */}
      <div className="card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Custos por Serviço</h2>
        </div>
        
        {aggregated.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhum dado de custo disponível ainda.
            <br />
            <span className="text-sm">Os custos serão rastreados automaticamente quando houver uso de APIs.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Serviço</th>
                  <th className="text-right p-3">Custo Total</th>
                  <th className="text-right p-3">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {aggregated.map((item, index) => {
                  const percentage = data!.total > 0 
                    ? ((item.total_cost / data!.total) * 100).toFixed(1)
                    : '0.0';
                  
                  return (
                    <tr key={index} className="border-t hover:bg-slate-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-medium">{item.service}</span>
                        </div>
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
                  <td className="p-3">TOTAL</td>
                  <td className="p-3 text-right">R$ {total}</td>
                  <td className="p-3 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Gráfico de Barras Simples */}
      {aggregated.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Distribuição de Custos</h2>
          <div className="space-y-3">
            {aggregated.map((item, index) => {
              const percentage = data!.total > 0 
                ? (item.total_cost / data!.total) * 100
                : 0;
              
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.service}</span>
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
    </div>
  );
}
