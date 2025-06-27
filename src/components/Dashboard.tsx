
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Agendamentos Hoje',
      value: '12',
      change: '+8%',
      changeType: 'positive',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Clientes Ativos',
      value: '247',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Taxa de Comparecimento',
      value: '94%',
      change: '+2%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Faturamento Previsto',
      value: 'R$ 3.240',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const recentAppointments = [
    {
      id: 1,
      client: 'Maria Silva',
      service: 'Corte + Escova',
      time: '09:00',
      status: 'confirmed',
      professional: 'Ana Costa'
    },
    {
      id: 2,
      client: 'João Santos',
      service: 'Barba + Cabelo',
      time: '10:30',
      status: 'pending',
      professional: 'Carlos Souza'
    },
    {
      id: 3,
      client: 'Isabella Oliveira',
      service: 'Manicure',
      time: '14:00',
      status: 'confirmed',
      professional: 'Fernanda Lima'
    },
    {
      id: 4,
      client: 'Pedro Almeida',
      service: 'Massagem Relaxante',
      time: '16:00',
      status: 'completed',
      professional: 'Ricardo Mendes'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluído', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio hoje</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.change} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Agendamentos de Hoje
              </CardTitle>
              <CardDescription>
                Próximos compromissos e status atual
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {appointment.client.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{appointment.client}</p>
                    <p className="text-sm text-gray-500">{appointment.service}</p>
                    <p className="text-xs text-gray-400">com {appointment.professional}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {appointment.time}
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-16 flex flex-col">
              <Calendar className="w-5 h-5 mb-1" />
              <span className="text-sm">Novo Agendamento</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <Users className="w-5 h-5 mb-1" />
              <span className="text-sm">Cadastrar Cliente</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <CheckCircle className="w-5 h-5 mb-1" />
              <span className="text-sm">Check-in</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <TrendingUp className="w-5 h-5 mb-1" />
              <span className="text-sm">Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
