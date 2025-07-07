
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, TrendingUp, DollarSign, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardCharts from './DashboardCharts';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    activeClients: 0,
    attendanceRate: 0,
    expectedRevenue: 0,
    confirmedToday: 0,
    completedToday: 0,
    cancelledToday: 0
  });
  
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Carregar agendamentos de hoje
      const { data: todayAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (name, email, phone),
          services (name, price, duration),
          professionals (name)
        `)
        .eq('user_id', user.id)
        .eq('date', today)
        .order('time');

      if (appointmentsError) throw appointmentsError;

      // Carregar total de clientes ativos
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id);

      if (clientsError) throw clientsError;

      // Calcular estatísticas
      const appointments = todayAppointments || [];
      const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;
      const completedCount = appointments.filter(apt => apt.status === 'completed').length;
      const cancelledCount = appointments.filter(apt => apt.status === 'cancelled').length;
      
      // Faturamento previsto (excluindo cancelados)
      const revenue = appointments
        .filter(apt => apt.status !== 'cancelled')
        .reduce((sum, apt) => sum + (apt.services?.price || 0), 0);

      // Taxa de comparecimento (baseada nos concluídos vs agendados)
      const totalScheduled = appointments.filter(apt => apt.status !== 'cancelled').length;
      const attendanceRate = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

      setStats({
        todayAppointments: appointments.length,
        activeClients: clients?.length || 0,
        attendanceRate,
        expectedRevenue: revenue,
        confirmedToday: confirmedCount,
        completedToday: completedCount,
        cancelledToday: cancelledCount
      });

      // Formatar agendamentos recentes para exibição
      const formattedAppointments = appointments.slice(0, 4).map(apt => ({
        id: apt.id,
        client: apt.clients?.name || 'Cliente não encontrado',
        service: apt.services?.name || 'Serviço não encontrado',
        time: apt.time,
        status: apt.status,
        professional: apt.professionals?.name || 'Profissional não encontrado'
      }));

      setRecentAppointments(formattedAppointments);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800 border-green-200' },
      scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      completed: { label: 'Concluído', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action clicked:', action);
    switch (action) {
      case 'new-appointment':
        console.log('Navigating to calendar for new appointment');
        if (onNavigate) {
          onNavigate('calendar');
        }
        break;
      case 'new-client':
        console.log('Navigating to clients');
        if (onNavigate) {
          onNavigate('clients');
        }
        break;
      case 'check-in':
        console.log('Opening check-in functionality');
        if (onNavigate) {
          onNavigate('checkin');
        }
        break;
      case 'reports':
        console.log('Opening reports');
        if (onNavigate) {
          onNavigate('reports');
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio hoje</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Sistema Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Agendamentos Hoje
            </CardTitle>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {stats.todayAppointments}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="text-green-600">{stats.confirmedToday} confirmados</span>
                <span className="text-purple-600">{stats.completedToday} concluídos</span>
                {stats.cancelledToday > 0 && (
                  <span className="text-red-600">{stats.cancelledToday} cancelados</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes Ativos
            </CardTitle>
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {stats.activeClients}
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Base de clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Comparecimento
            </CardTitle>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {stats.attendanceRate}%
            </div>
            <p className="text-xs text-purple-600 flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Baseado nos agendamentos concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Faturamento Previsto
            </CardTitle>
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              R$ {stats.expectedRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-orange-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Excluindo cancelamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Charts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Análise de Performance
              </CardTitle>
              <CardDescription>
                Gráficos interativos com métricas do seu negócio
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate?.('calendar')}
            >
              Ver Agenda
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DashboardCharts onNavigate={onNavigate} />
        </CardContent>
      </Card>

      {/* Recent Appointments - Simplified */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Próximos Agendamentos
          </CardTitle>
          <CardDescription>
            Agendamentos de hoje que precisam de atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum agendamento para hoje</p>
              <Button 
                onClick={() => onNavigate?.('calendar')}
                className="bg-primary hover:bg-primary/90"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Ir para Agenda
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {appointment.client.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{appointment.client}</p>
                      <p className="text-xs text-gray-500">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{appointment.time}</span>
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>
              ))}
              {recentAppointments.length > 3 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate?.('calendar')}
                  >
                    Ver todos os {recentAppointments.length} agendamentos
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col hover:bg-primary/5 border-primary/20"
              onClick={() => handleQuickAction('new-client')}
            >
              <Users className="w-6 h-6 mb-2 text-primary" />
              <span className="text-sm font-medium">Cadastrar Cliente</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col hover:bg-primary/5 border-primary/20"
              onClick={() => handleQuickAction('check-in')}
            >
              <CheckCircle className="w-6 h-6 mb-2 text-primary" />
              <span className="text-sm font-medium">Check-in</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col hover:bg-primary/5 border-primary/20"
              onClick={() => handleQuickAction('reports')}
            >
              <TrendingUp className="w-6 h-6 mb-2 text-primary" />
              <span className="text-sm font-medium">Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
