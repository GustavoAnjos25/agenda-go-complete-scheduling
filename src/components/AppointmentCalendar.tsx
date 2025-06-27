import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import NewAppointmentModal from './NewAppointmentModal';

const AppointmentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      time: '09:00',
      duration: 30,
      client: 'Maria Silva',
      service: 'Corte + Escova',
      professional: 'Ana Costa',
      status: 'confirmed',
      price: 80
    },
    {
      id: 2,
      time: '10:30',
      duration: 45,
      client: 'João Santos',
      service: 'Barba + Cabelo',
      professional: 'Carlos Souza',
      status: 'pending',
      price: 65
    },
    {
      id: 3,
      time: '14:00',
      duration: 60,
      client: 'Isabella Oliveira',
      service: 'Manicure',
      professional: 'Fernanda Lima',
      status: 'confirmed',
      price: 45
    },
    {
      id: 4,
      time: '16:00',
      duration: 90,
      client: 'Pedro Almeida',
      service: 'Massagem Relaxante',
      professional: 'Ricardo Mendes',
      status: 'completed',
      price: 120
    }
  ]);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const professionals = ['Ana Costa', 'Carlos Souza', 'Fernanda Lima', 'Ricardo Mendes'];

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      confirmed: 'Confirmado',
      pending: 'Pendente',
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
    console.log('Opening new appointment modal');
    setIsNewAppointmentOpen(true);
  };

  const handleSaveAppointment = (newAppointment: any) => {
    console.log('Saving new appointment:', newAppointment);
    setAppointments(prev => [...prev, newAppointment]);
    alert(`Agendamento criado com sucesso!\n\nCliente: ${newAppointment.client}\nServiço: ${newAppointment.service}\nData: ${newAppointment.date}\nHorário: ${newAppointment.time}`);
  };

  const handleAppointmentClick = (appointment: any) => {
    const options = ['Reagendar', 'Cancelar', 'Alterar Status', 'Fechar'];
    const choice = prompt(`Agendamento: ${appointment.client}\n\nEscolha uma opção:\n1 - Reagendar\n2 - Cancelar\n3 - Alterar Status\n4 - Fechar\n\nDigite o número da opção:`);
    
    switch(choice) {
      case '1':
        alert('Funcionalidade de reagendamento será implementada em breve!');
        break;
      case '2':
        if (confirm(`Tem certeza que deseja cancelar o agendamento de ${appointment.client}?`)) {
          setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
          alert('Agendamento cancelado com sucesso!');
        }
        break;
      case '3':
        const newStatus = prompt('Novo status:\n1 - Confirmado\n2 - Pendente\n3 - Concluído\n\nDigite o número:');
        const statusMap = { '1': 'confirmed', '2': 'pending', '3': 'completed' };
        if (newStatus && statusMap[newStatus as keyof typeof statusMap]) {
          setAppointments(prev => prev.map(apt => 
            apt.id === appointment.id 
              ? { ...apt, status: statusMap[newStatus as keyof typeof statusMap] }
              : apt
          ));
          alert('Status atualizado com sucesso!');
        }
        break;
    }
  };

  const handleTimeSlotClick = (time: string) => {
    const hasAppointment = appointments.some(apt => apt.time === time);
    if (hasAppointment) {
      const appointment = appointments.find(apt => apt.time === time);
      handleAppointmentClick(appointment);
    } else {
      const shouldCreate = confirm(`Horário ${time} disponível!\n\nDeseja criar um novo agendamento para este horário?`);
      if (shouldCreate) {
        setIsNewAppointmentOpen(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Agenda</h1>
          <p className="text-gray-600">Gerencie todos os agendamentos</p>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          onClick={handleNewAppointment}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  {formatDate(currentDate)}
                </CardTitle>
                <CardDescription>
                  {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} hoje
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
              <Button 
                variant={viewMode === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Mês
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm font-medium text-gray-600">Próximo em</p>
                <p className="text-2xl font-bold text-gray-800">30 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Profissionais Ativos</p>
                <p className="text-2xl font-bold text-gray-800">{professionals.length}</p>
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
                  R$ {appointments.reduce((sum, apt) => sum + apt.price, 0)}
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
                Clique em um agendamento para ver detalhes ou fazer alterações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className={`p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer ${getStatusColor(appointment.status)}`}
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-center justify-between">
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
                      
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{appointment.time}</span>
                          <span className="text-sm text-gray-500">({appointment.duration}min)</span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <Badge variant="outline" className={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                          <span className="font-semibold text-green-600">
                            R$ {appointment.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
};

export default AppointmentCalendar;
