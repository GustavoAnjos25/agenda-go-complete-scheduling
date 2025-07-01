
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
  const [systemSettings, setSystemSettings] = useState({});
  const [blockedDates, setBlockedDates] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [dateForm, setDateForm] = useState({ date: '', reason: '', isHoliday: false });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSystemSettings();
      loadBlockedDates();
      loadProfessionals();
    }
  }, [user]);

  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const settingsObj = {};
      data?.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      setSystemSettings(settingsObj);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('user_id', user.id)
        .order('date');

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (error) {
      console.error('Erro ao carregar datas bloqueadas:', error);
    }
  };

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const saveSystemSetting = async (key, value, description = '') => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          description,
          user_id: user.id
        });

      if (error) throw error;

      setSystemSettings(prev => ({
        ...prev,
        [key]: value
      }));

      toast({
        title: "Configuração salva",
        description: "Alterações aplicadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleAddBlockedDate = async () => {
    if (!dateForm.date) {
      toast({
        title: "Data obrigatória",
        description: "Selecione uma data para bloquear",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .insert([{
          date: dateForm.date,
          reason: dateForm.reason,
          is_holiday: dateForm.isHoliday,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Data bloqueada",
        description: "Data adicionada aos bloqueios",
      });

      setIsDateDialogOpen(false);
      setDateForm({ date: '', reason: '', isHoliday: false });
      loadBlockedDates();
    } catch (error) {
      toast({
        title: "Erro ao bloquear data",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBlockedDate = async (id) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Data desbloqueada",
        description: "Data removida dos bloqueios",
      });

      loadBlockedDates();
    } catch (error) {
      toast({
        title: "Erro ao desbloquear",
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

      loadProfessionals();
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const workingHours = systemSettings.working_hours || { start: '08:00', end: '18:00' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Configure o sistema e gerencie permissões</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Profissionais Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {professionals.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Datas Bloqueadas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {blockedDates.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horários de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle>Horários de Funcionamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="start-time">Horário de Abertura</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={workingHours.start}
                  onChange={(e) => {
                    const newHours = { ...workingHours, start: e.target.value };
                    saveSystemSetting('working_hours', newHours);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="end-time">Horário de Fechamento</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={workingHours.end}
                  onChange={(e) => {
                    const newHours = { ...workingHours, end: e.target.value };
                    saveSystemSetting('working_hours', newHours);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datas Bloqueadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-600" />
                Datas Bloqueadas
              </span>
              <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bloquear Data</DialogTitle>
                    <DialogDescription>
                      Adicione uma data que não estará disponível para agendamentos
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="block-date">Data</Label>
                      <Input
                        id="block-date"
                        type="date"
                        value={dateForm.date}
                        onChange={(e) => setDateForm({...dateForm, date: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="block-reason">Motivo</Label>
                      <Textarea
                        id="block-reason"
                        placeholder="Ex: Feriado, Manutenção..."
                        value={dateForm.reason}
                        onChange={(e) => setDateForm({...dateForm, reason: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-holiday"
                        checked={dateForm.isHoliday}
                        onCheckedChange={(checked) => setDateForm({...dateForm, isHoliday: checked})}
                      />
                      <Label htmlFor="is-holiday">É um feriado</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddBlockedDate} disabled={loading}>
                      {loading ? "Salvando..." : "Bloquear Data"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {blockedDates.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma data bloqueada</p>
              ) : (
                blockedDates.map((blocked) => (
                  <div key={blocked.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(blocked.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      {blocked.reason && (
                        <p className="text-xs text-gray-500">{blocked.reason}</p>
                      )}
                      {blocked.is_holiday && (
                        <Badge variant="outline" className="text-xs">Feriado</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveBlockedDate(blocked.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gerenciar Profissionais */}
        <Card className="md:col-span-2 lg:col-span-3">
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
