
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Shield, Calendar, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminPanel = () => {
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '18:00' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Carregar profissionais
      const { data: professionalsData, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id);

      if (profError) throw profError;
      setProfessionals(professionalsData || []);

      // Carregar serviços
      const { data: servicesData, error: servError } = await supabase
        .from('services')
        .select('*');

      if (servError) throw servError;
      setServices(servicesData || []);

      // Carregar agendamentos do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);

      const { data: appointmentsData, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (apptError) throw apptError;
      setAppointments(appointmentsData || []);

      // Carregar clientes
      const { data: clientsData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id);

      if (clientError) throw clientError;
      setClients(clientsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const toggleProfessionalStatus = async (professionalId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('professionals')
        .update({ status: newStatus })
        .eq('id', professionalId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Profissional ${newStatus === 'active' ? 'ativado' : 'desativado'}`,
      });

      loadData();
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const saveWorkingHours = async () => {
    setLoading(true);
    try {
      // Aplicar os horários para todos os profissionais
      const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Domingo a Sábado
      
      for (const professional of professionals) {
        for (const dayOfWeek of daysOfWeek) {
          // Primeiro, deletar disponibilidade existente para este dia
          await supabase
            .from('professional_availability')
            .delete()
            .eq('professional_id', professional.id)
            .eq('day_of_week', dayOfWeek);
          
          // Depois, inserir nova disponibilidade (segunda a sexta)
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            await supabase
              .from('professional_availability')
              .insert({
                professional_id: professional.id,
                day_of_week: dayOfWeek,
                is_available: true,
                start_time: workingHours.start,
                end_time: workingHours.end
              });
          }
        }
      }

      toast({
        title: "Horários salvos com sucesso!",
        description: "Horários aplicados para todos os profissionais (Segunda a Sexta)",
      });
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      toast({
        title: "Erro ao salvar horários",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const activeProfessionals = professionals.filter(p => p.status === 'active').length;
  const totalClients = clients.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Configure o sistema e gerencie permissões</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeProfessionals}
            </div>
            <p className="text-sm text-gray-600">Ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalAppointments}
            </div>
            <p className="text-sm text-gray-600">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {services.length}
            </div>
            <p className="text-sm text-gray-600">Cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalClients}
            </div>
            <p className="text-sm text-gray-600">Cadastrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Horários de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle>Horários de Funcionamento</CardTitle>
            <CardDescription>
              Configure os horários padrão de atendimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="start-time">Horário de Abertura</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={workingHours.start}
                  onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-time">Horário de Fechamento</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={workingHours.end}
                  onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <Button 
                onClick={saveWorkingHours} 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Aplicando..." : "Aplicar para Todos os Profissionais"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance do Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Performance do Mês</CardTitle>
            <CardDescription>
              Estatísticas dos agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total de Agendamentos:</span>
                <span className="font-bold">{totalAppointments}</span>
              </div>
              <div className="flex justify-between">
                <span>Concluídos:</span>
                <span className="font-bold text-green-600">{completedAppointments}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Conclusão:</span>
                <span className="font-bold">
                  {totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciar Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Profissionais</CardTitle>
          <CardDescription>
            Ative ou desative profissionais para controlar disponibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map((professional) => (
              <div key={professional.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{professional.name}</h4>
                  <p className="text-sm text-gray-500">{professional.email}</p>
                  <Badge 
                    variant={professional.status === 'active' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {professional.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <Switch
                  checked={professional.status === 'active'}
                  onCheckedChange={() => toggleProfessionalStatus(professional.id, professional.status)}
                />
              </div>
            ))}
            
            {professionals.length === 0 && (
              <div className="col-span-full text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum profissional cadastrado</p>
                <p className="text-sm text-gray-400">Vá para "Profissionais" para adicionar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
