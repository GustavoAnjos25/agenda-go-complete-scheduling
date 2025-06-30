
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const CheckIn = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadTodayAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (name, email, phone),
          services (name, duration),
          professionals (name)
        `)
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayAppointments();
  }, [user, selectedDate]);

  const updateCheckInStatus = async (appointmentId, status) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          check_in_status: status,
          status: status === 'present' ? 'completed' : 'cancelled'
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Check-in atualizado",
        description: `Cliente marcado como ${status === 'present' ? 'presente' : 'ausente'}`,
      });

      loadTodayAppointments();
    } catch (error) {
      toast({
        title: "Erro ao atualizar check-in",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (appointment) => {
    if (appointment.check_in_status === 'present') {
      return <Badge className="bg-green-100 text-green-800">Presente</Badge>;
    }
    if (appointment.check_in_status === 'absent') {
      return <Badge className="bg-red-100 text-red-800">Ausente</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Aguardando</Badge>;
  };

  const isPastTime = (time) => {
    const now = new Date();
    const appointmentTime = new Date(`${selectedDate}T${time}`);
    return appointmentTime < now;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-in</h1>
          <p className="text-gray-600">Controle de presença dos clientes</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Data:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Estatísticas do dia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.check_in_status === 'present').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter(a => a.check_in_status === 'absent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => a.check_in_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos do Dia</CardTitle>
          <CardDescription>
            {new Date(selectedDate).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando agendamentos...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum agendamento para esta data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`border rounded-lg p-4 ${
                    appointment.check_in_status === 'present' ? 'bg-green-50 border-green-200' :
                    appointment.check_in_status === 'absent' ? 'bg-red-50 border-red-200' :
                    isPastTime(appointment.time) ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-bold text-lg">{appointment.time}</span>
                        {getStatusBadge(appointment)}
                        {isPastTime(appointment.time) && appointment.check_in_status === 'pending' && (
                          <Badge variant="outline" className="text-orange-600">Atrasado</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="font-semibold">{appointment.clients?.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {appointment.clients?.phone || 'Não informado'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {appointment.clients?.email || 'Não informado'}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{appointment.services?.name}</p>
                          <p className="text-sm text-gray-600">
                            Duração: {appointment.services?.duration} min
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{appointment.professionals?.name}</p>
                          <p className="text-sm text-gray-600">Profissional</p>
                        </div>
                      </div>
                    </div>
                    
                    {appointment.check_in_status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => updateCheckInStatus(appointment.id, 'present')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Presente
                        </Button>
                        <Button
                          onClick={() => updateCheckInStatus(appointment.id, 'absent')}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Ausente
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckIn;
