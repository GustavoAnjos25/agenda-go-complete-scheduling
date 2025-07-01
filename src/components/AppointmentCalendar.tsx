import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import NewAppointmentModalWithDB from './NewAppointmentModalWithDB';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AppointmentActions from './AppointmentActions';

const AppointmentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, currentDate]);

  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (name, email, phone),
          services (name, price, duration),
          professionals (name)
        `)
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .order('time');

      if (error) throw error;

      const formattedAppointments = data?.map(apt => ({
        id: apt.id,
        time: apt.time,
        duration: apt.services?.duration || 30,
        client: apt.clients?.name || 'Cliente não encontrado',
        service: apt.services?.name || 'Serviço não encontrado',
        professional: apt.professionals?.name || 'Profissional não encontrado',
        status: apt.status,
        price: apt.services?.price || 0,
        notes: apt.notes,
        checkInStatus: apt.check_in_status,
        paymentStatus: apt.payment_status
      })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = async (appointment: any) => {
    try {
      // Buscar dados completos do agendamento para edição
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (name, email, phone),
          services (id, name),
          professionals (id, name)
        `)
        .eq('id', appointment.id)
        .single();

      if (error) throw error;

      const appointmentData = {
        ...data,
        client: data.clients?.name,
        clientEmail: data.clients?.email,
        clientPhone: data.clients?.phone,
        service_id: data.services?.id,
        professional_id: data.professionals?.id
      };

      setEditingAppointment(appointmentData);
      setIsNewAppointmentOpen(true);
    } catch (error) {
      console.error('Erro ao carregar dados do agendamento:', error);
      toast({
        title: "Erro ao carregar agendamento",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleCloseModal = () => {
    setIsNewAppointmentOpen(false);
    setEditingAppointment(null);
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setIsNewAppointmentOpen(true);
  };

  const handleTimeSlotClick = (time: string) => {
    const hasAppointment = appointments.some(apt => apt.time === time);
    if (hasAppointment) {
      const appointment = appointments.find(apt => apt.time === time);
    } else {
      setIsNewAppointmentOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Agenda</h1>
          <p className="text-gray-600">Gerencie todos os agendamentos</p>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 w-full sm:w-auto"
          onClick={handleNewAppointment}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  {formatDate(currentDate)}
                </CardTitle>
                <CardDescription>
                  {loading ? 'Carregando...' : `${appointments.length} agendamento${appointments.length !== 1 ? 's' : ''} hoje`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === 'day' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Dia
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Semana
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
                <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-gray-800">
                  {appointments.filter(apt => apt.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {appointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <span className="text-sm text-green-600">R$</span>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Faturamento Previsto</p>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {appointments.reduce((sum, apt) => sum + (apt.price || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Time Slots */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeSlots.map((time) => (
                  <div 
                    key={time} 
                    className={`p-2 text-sm rounded border cursor-pointer hover:bg-opacity-80 transition-colors ${
                      appointments.some(apt => apt.time === time)
                        ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => handleTimeSlotClick(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agendamentos do Dia</CardTitle>
              <CardDescription>
                Gerencie os agendamentos com os botões de ação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Carregando agendamentos...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum agendamento para hoje</p>
                  <Button onClick={handleNewAppointment} className="bg-gradient-to-r from-blue-500 to-green-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Agendamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className={`p-4 rounded-lg border-2 hover:shadow-md transition-all ${getStatusColor(appointment.status)}`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {appointment.client.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{appointment.client}</h3>
                              <p className="text-sm text-gray-600">{appointment.service}</p>
                              <p className="text-xs text-gray-500">com {appointment.professional}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:text-right">
                            <div className="flex items-center justify-start sm:justify-end space-x-2 mb-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{appointment.time}</span>
                              <span className="text-sm text-gray-500">({appointment.duration}min)</span>
                            </div>
                            <div className="flex items-center justify-start sm:justify-end space-x-2">
                              <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                              <span className="font-semibold text-green-600">
                                R$ {appointment.price?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botões de Ação */}
                        <div className="border-t pt-3">
                          <AppointmentActions
                            appointmentId={appointment.id}
                            currentStatus={appointment.status}
                            onStatusChange={loadAppointments}
                            onEdit={() => handleEditAppointment(appointment)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <NewAppointmentModalWithDB
        isOpen={isNewAppointmentOpen}
        onClose={handleCloseModal}
        onSave={loadAppointments}
        editingAppointment={editingAppointment}
      />
    </div>
  );
};

export default AppointmentCalendar;
