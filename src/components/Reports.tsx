
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Carregar profissionais
      const { data: profsData } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id);
      setProfessionals(profsData || []);

      // Carregar serviços
      const { data: servicesData } = await supabase
        .from('services')
        .select('*');
      setServices(servicesData || []);

      // Carregar agendamentos com filtros
      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients (name, email, phone),
          services (name, price),
          professionals (name)
        `)
        .eq('user_id', user.id);

      if (dateFrom) query = query.gte('date', dateFrom);
      if (dateTo) query = query.lte('date', dateTo);
      if (selectedProfessional !== 'all') query = query.eq('professional_id', selectedProfessional);
      if (selectedService !== 'all') query = query.eq('service_id', selectedService);

      const { data: appointmentsData } = await query.order('date', { ascending: false });
      setAppointments(appointmentsData || []);

      // Calcular estatísticas
      if (appointmentsData) {
        const total = appointmentsData.length;
        const confirmed = appointmentsData.filter(a => a.status === 'confirmed').length;
        const completed = appointmentsData.filter(a => a.status === 'completed').length;
        const cancelled = appointmentsData.filter(a => a.status === 'cancelled').length;
        const revenue = appointmentsData
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.services?.price || 0), 0);

        setStats({ total, confirmed, completed, cancelled, revenue });
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar relatórios",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, dateFrom, dateTo, selectedProfessional, selectedService]);

  const exportToPDF = () => {
    toast({
      title: "Exportando relatório",
      description: "Funcionalidade será implementada em breve",
    });
  };

  const exportToExcel = () => {
    toast({
      title: "Exportando para Excel",
      description: "Funcionalidade será implementada em breve",
    });
  };

  const chartData = [
    { name: 'Agendados', value: stats.total - stats.confirmed - stats.completed - stats.cancelled, color: '#8884d8' },
    { name: 'Confirmados', value: stats.confirmed, color: '#82ca9d' },
    { name: 'Concluídos', value: stats.completed, color: '#ffc658' },
    { name: 'Cancelados', value: stats.cancelled, color: '#ff7c7c' }
  ];

  const revenueData = appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, appointment) => {
      const date = new Date(appointment.date).toLocaleDateString('pt-BR');
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.revenue += appointment.services?.price || 0;
      } else {
        acc.push({ date, revenue: appointment.services?.price || 0 });
      }
      return acc;
    }, [])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada dos seus agendamentos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom">Data Inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Data Final</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Serviço</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.revenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos Detalhados</CardTitle>
          <CardDescription>Lista completa dos agendamentos filtrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Horário</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Serviço</th>
                    <th className="text-left p-2">Profissional</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(appointment.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">{appointment.time}</td>
                      <td className="p-2">{appointment.clients?.name}</td>
                      <td className="p-2">{appointment.services?.name}</td>
                      <td className="p-2">{appointment.professionals?.name}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'completed' ? 'Concluído' :
                           appointment.status === 'confirmed' ? 'Confirmado' :
                           appointment.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                        </span>
                      </td>
                      <td className="p-2">R$ {appointment.services?.price?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum agendamento encontrado com os filtros selecionados
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
