import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardChartsProps {
  onNavigate?: (tab: string) => void;
}

const DashboardCharts = ({ onNavigate }: DashboardChartsProps) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState({
    appointments: true,
    revenue: true,
    cancelled: true,
    completed: true
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChartData();
    }
  }, [user]);

  const loadChartData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Carregar dados dos últimos 7 dias
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      const chartDataPromises = dates.map(async (date) => {
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select(`
            *,
            services (price)
          `)
          .eq('user_id', user.id)
          .eq('date', date);

        if (error) throw error;

        const totalAppointments = appointments?.length || 0;
        const completedAppointments = appointments?.filter(apt => apt.status === 'completed').length || 0;
        const cancelledAppointments = appointments?.filter(apt => apt.status === 'cancelled').length || 0;
        const revenue = appointments?.filter(apt => apt.status !== 'cancelled')
          .reduce((sum, apt) => sum + (apt.services?.price || 0), 0) || 0;

        return {
          date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
          appointments: totalAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          revenue: revenue
        };
      });

      const data = await Promise.all(chartDataPromises);
      setChartData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricToggle = (metric: string) => {
    setActiveMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Carregando dados dos gráficos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas do Dashboard</CardTitle>
          <CardDescription>
            Selecione as métricas que deseja visualizar nos gráficos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="appointments"
                checked={activeMetrics.appointments}
                onCheckedChange={() => handleMetricToggle('appointments')}
              />
              <label htmlFor="appointments" className="text-sm font-medium cursor-pointer">
                Agendamentos
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="revenue"
                checked={activeMetrics.revenue}
                onCheckedChange={() => handleMetricToggle('revenue')}
              />
              <label htmlFor="revenue" className="text-sm font-medium cursor-pointer">
                Faturamento
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={activeMetrics.completed}
                onCheckedChange={() => handleMetricToggle('completed')}
              />
              <label htmlFor="completed" className="text-sm font-medium cursor-pointer">
                Concluídos
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cancelled"
                checked={activeMetrics.cancelled}
                onCheckedChange={() => handleMetricToggle('cancelled')}
              />
              <label htmlFor="cancelled" className="text-sm font-medium cursor-pointer">
                Cancelamentos
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência dos Últimos 7 Dias</CardTitle>
          <CardDescription>
            Acompanhe a evolução das suas métricas ao longo dos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                {activeMetrics.appointments && (
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Agendamentos"
                  />
                )}
                {activeMetrics.completed && (
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Concluídos"
                  />
                )}
                {activeMetrics.cancelled && (
                  <Line
                    type="monotone"
                    dataKey="cancelled"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Cancelamentos"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart for Revenue */}
      {activeMetrics.revenue && (
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Diário</CardTitle>
            <CardDescription>
              Receita gerada por dia (excluindo cancelamentos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="#f59e0b"
                    name="Faturamento (R$)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardCharts;