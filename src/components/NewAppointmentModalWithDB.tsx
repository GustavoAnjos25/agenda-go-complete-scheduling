import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import TimeSlotSelector from './TimeSlotSelector';
import PhoneInput from './PhoneInput';
import ServiceInfoDisplay from './ServiceInfoDisplay';

interface NewAppointmentModalWithDBProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingAppointment?: any;
}

const NewAppointmentModalWithDB = ({ isOpen, onClose, onSave, editingAppointment }: NewAppointmentModalWithDBProps) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    service: '',
    professional: '',
    date: '',
    time: '',
    notes: ''
  });
  
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedServiceInfo, setSelectedServiceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      loadServices();
      loadProfessionals();
    }
  }, [user, isOpen]);

  // Carregar dados para edição
  useEffect(() => {
    if (editingAppointment && isOpen) {
      console.log('🔍 [DEBUG] Carregando dados para edição:', editingAppointment);
      
      // DEBUG: Verificar dados de data/hora do agendamento
      console.log('🔍 [DEBUG] Data original do agendamento:', editingAppointment.date);
      console.log('🔍 [DEBUG] Hora original do agendamento:', editingAppointment.time);
      console.log('🔍 [DEBUG] Timezone do browser:', Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      // Verificar se a data está sendo interpretada corretamente
      if (editingAppointment.date) {
        const originalDate = new Date(editingAppointment.date);
        const localDate = new Date(originalDate.getTime() + originalDate.getTimezoneOffset() * 60000);
        console.log('🔍 [DEBUG] Data original como Date object:', originalDate);
        console.log('🔍 [DEBUG] Data ajustada para local:', localDate);
        console.log('🔍 [DEBUG] ISO String da data original:', originalDate.toISOString());
        console.log('🔍 [DEBUG] ISO String da data local:', localDate.toISOString());
        console.log('🔍 [DEBUG] Dia da semana da data original:', originalDate.getDay()); // 0=domingo, 1=segunda, etc.
        console.log('🔍 [DEBUG] Dia da semana da data local:', localDate.getDay());
      }
      
      setFormData({
        clientName: editingAppointment.client || '',
        clientEmail: editingAppointment.clientEmail || '',
        clientPhone: editingAppointment.clientPhone || '',
        service: editingAppointment.service_id || '',
        professional: editingAppointment.professional_id || '',
        date: editingAppointment.date || '',
        time: editingAppointment.time || '',
        notes: editingAppointment.notes || ''
      });
    } else if (!editingAppointment && isOpen) {
      // Resetar form para novo agendamento
      console.log('🔍 [DEBUG] Resetando formulário para novo agendamento');
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        service: '',
        professional: '',
        date: '',
        time: '',
        notes: ''
      });
      setSelectedServiceInfo(null);
    }
  }, [editingAppointment, isOpen]);

  useEffect(() => {
    if (formData.professional) {
      console.log('🔍 [DEBUG] Carregando serviços para profissional:', formData.professional);
      loadServicesByProfessional(formData.professional);
    } else {
      setFilteredServices(services);
    }
  }, [formData.professional, services]);

  // Atualizar informações do serviço quando selecionado
  useEffect(() => {
    if (formData.service) {
      const service = filteredServices.find(s => s.id === formData.service);
      console.log('🔍 [DEBUG] Serviço selecionado:', service);
      setSelectedServiceInfo(service);
    } else {
      setSelectedServiceInfo(null);
    }
  }, [formData.service, filteredServices]);

  // DEBUG: Monitorar mudanças na data selecionada
  useEffect(() => {
    if (formData.date) {
      console.log('🔍 [DEBUG] Data selecionada mudou:', formData.date);
      const selectedDate = new Date(formData.date);
      const localDate = new Date(selectedDate.getTime() + selectedDate.getTimezoneOffset() * 60000);
      console.log('🔍 [DEBUG] Data como Date object:', selectedDate);
      console.log('🔍 [DEBUG] Data ajustada local:', localDate);
      console.log('🔍 [DEBUG] Dia da semana selecionado:', selectedDate.getDay());
      console.log('🔍 [DEBUG] Dia da semana local:', localDate.getDay());
      console.log('🔍 [DEBUG] Timezone offset:', selectedDate.getTimezoneOffset());
    }
  }, [formData.date]);

  const loadServices = async () => {
    try {
      console.log('🔍 [DEBUG] Carregando serviços...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      console.log('🔍 [DEBUG] Serviços carregados:', data?.length || 0);
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error('❌ [ERROR] Erro ao carregar serviços:', error);
    }
  };

  const loadProfessionals = async () => {
    try {
      console.log('🔍 [DEBUG] Carregando profissionais...');
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('status', 'active')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      console.log('🔍 [DEBUG] Profissionais carregados:', data?.length || 0);
      console.log('🔍 [DEBUG] Dados dos profissionais:', data);
      setProfessionals(data || []);
    } catch (error) {
      console.error('❌ [ERROR] Erro ao carregar profissionais:', error);
    }
  };

  const loadServicesByProfessional = async (professionalId: string) => {
    try {
      console.log('🔍 [DEBUG] Carregando serviços do profissional:', professionalId);
      const { data, error } = await supabase
        .from('professional_services')
        .select(`
          services (*)
        `)
        .eq('professional_id', professionalId);

      if (error) throw error;
      
      const professionalServices = data?.map(ps => ps.services).filter(Boolean) || [];
      console.log('🔍 [DEBUG] Serviços do profissional encontrados:', professionalServices.length);
      setFilteredServices(professionalServices);
      
      // Limpar serviço selecionado se não estiver mais disponível
      if (formData.service && !professionalServices.find(s => s.id === formData.service)) {
        console.log('🔍 [DEBUG] Limpando serviço selecionado (não disponível para este profissional)');
        setFormData(prev => ({ ...prev, service: '' }));
      }
    } catch (error) {
      console.error('❌ [ERROR] Erro ao carregar serviços do profissional:', error);
      setFilteredServices([]);
    }
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  };

  const handleSave = async () => {
    console.log('🔍 [DEBUG] Iniciando salvamento do agendamento...');
    console.log('🔍 [DEBUG] Dados do formulário:', formData);
    
    if (!formData.clientName || !formData.service || !formData.professional || !formData.date || !formData.time) {
      console.log('❌ [ERROR] Campos obrigatórios não preenchidos');
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (formData.clientPhone && !validatePhone(formData.clientPhone)) {
      console.log('❌ [ERROR] Telefone inválido:', formData.clientPhone);
      toast({
        title: "Telefone inválido",
        description: "Digite um telefone válido no formato (XX) XXXXX-XXXX",
        variant: "destructive",
      });
      return;
    }

    // Validar se a data não é anterior ao dia atual
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('🔍 [DEBUG] Validação de data:');
    console.log('🔍 [DEBUG] Data selecionada:', selectedDate);
    console.log('🔍 [DEBUG] Data hoje:', today);
    console.log('🔍 [DEBUG] Data selecionada < hoje?', selectedDate < today);
    
    if (selectedDate < today) {
      console.log('❌ [ERROR] Data selecionada é anterior a hoje');
      toast({
        title: "Data inválida",
        description: "Não é possível agendar para datas passadas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let clientId;
      
      if (editingAppointment) {
        console.log('🔍 [DEBUG] Modo edição - Atualizando agendamento existente');
        // Para edição, usar o cliente existente
        clientId = editingAppointment.client_id;
        
        // Atualizar dados do cliente
        const { error: updateClientError } = await supabase
          .from('clients')
          .update({
            name: formData.clientName,
            email: formData.clientEmail || null,
            phone: formData.clientPhone || null,
          })
          .eq('id', clientId);

        if (updateClientError) throw updateClientError;

        // DEBUG: Verificar dados antes de salvar
        console.log('🔍 [DEBUG] Dados do agendamento que serão salvos:');
        console.log('🔍 [DEBUG] service_id:', formData.service);
        console.log('🔍 [DEBUG] professional_id:', formData.professional);
        console.log('🔍 [DEBUG] date:', formData.date);
        console.log('🔍 [DEBUG] time:', formData.time);
        console.log('🔍 [DEBUG] notes:', formData.notes);

        // Atualizar agendamento
        const { error: updateAppointmentError } = await supabase
          .from('appointments')
          .update({
            service_id: formData.service,
            professional_id: formData.professional,
            date: formData.date,
            time: formData.time,
            notes: formData.notes || null,
          })
          .eq('id', editingAppointment.id);

        if (updateAppointmentError) throw updateAppointmentError;

        console.log('✅ [SUCCESS] Agendamento atualizado com sucesso');
        toast({
          title: "Agendamento atualizado!",
          description: `Agendamento de ${formData.clientName} foi atualizado com sucesso`,
        });
      } else {
        console.log('🔍 [DEBUG] Modo criação - Criando novo agendamento');
        // Para novo agendamento
        // Verificar se cliente já existe pelo email (se fornecido) ou nome
        const { data: existingClients, error: searchError } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .or(`email.eq.${formData.clientEmail || 'null'},name.eq.${formData.clientName}`);

        if (searchError) throw searchError;

        if (existingClients && existingClients.length > 0) {
          console.log('🔍 [DEBUG] Cliente existente encontrado');
          clientId = existingClients[0].id;
        } else {
          console.log('🔍 [DEBUG] Criando novo cliente');
          // Criar novo cliente
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert([{
              name: formData.clientName,
              email: formData.clientEmail || null,
              phone: formData.clientPhone || null,
              user_id: user.id
            }])
            .select()
            .single();

          if (clientError) throw clientError;
          clientId = newClient.id;
        }

        // DEBUG: Verificar dados antes de criar agendamento
        console.log('🔍 [DEBUG] Dados do novo agendamento:');
        console.log('🔍 [DEBUG] client_id:', clientId);
        console.log('🔍 [DEBUG] service_id:', formData.service);
        console.log('🔍 [DEBUG] professional_id:', formData.professional);
        console.log('🔍 [DEBUG] date:', formData.date);
        console.log('🔍 [DEBUG] time:', formData.time);
        console.log('🔍 [DEBUG] user_id:', user.id);

        // Criar agendamento
        const { error: appointmentError } = await supabase
          .from('appointments')
          .insert([{
            client_id: clientId,
            service_id: formData.service,
            professional_id: formData.professional,
            date: formData.date,
            time: formData.time,
            notes: formData.notes || null,
            status: 'scheduled',
            user_id: user.id
          }]);

        if (appointmentError) throw appointmentError;

        console.log('✅ [SUCCESS] Novo agendamento criado com sucesso');
        toast({
          title: "Agendamento criado!",
          description: `Agendamento para ${formData.clientName} foi criado com sucesso`,
        });
      }

      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        service: '',
        professional: '',
        date: '',
        time: '',
        notes: ''
      });
      setSelectedServiceInfo(null);
      
      onSave();
      onClose();
    } catch (error) {
      console.error('❌ [ERROR] Erro ao salvar agendamento:', error);
      toast({
        title: "Erro ao salvar agendamento",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Definir data mínima como hoje
  const today = new Date().toISOString().split('T')[0];
  console.log('🔍 [DEBUG] Data mínima (hoje):', today);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription>
            {editingAppointment ? 'Edite os dados do agendamento' : 'Preencha os dados para criar um novo agendamento'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Dados do Cliente</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente*</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Nome completo do cliente"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Telefone</Label>
                  <PhoneInput
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(value) => setFormData({...formData, clientPhone: value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Agendamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Dados do Agendamento</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="professional">Profissional*</Label>
                <Select 
                  value={formData.professional} 
                  onValueChange={(value) => {
                    console.log('🔍 [DEBUG] Profissional selecionado:', value);
                    setFormData({...formData, professional: value, service: ''});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service">Serviço*</Label>
                <Select 
                  value={formData.service} 
                  onValueChange={(value) => {
                    console.log('🔍 [DEBUG] Serviço selecionado:', value);
                    setFormData({...formData, service: value});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Informações do Serviço Selecionado */}
            {selectedServiceInfo && (
              <ServiceInfoDisplay
                serviceName={selectedServiceInfo.name}
                duration={selectedServiceInfo.duration}
                price={selectedServiceInfo.price}
              />
            )}

            <div>
              <Label htmlFor="date">Data*</Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => {
                  console.log('🔍 [DEBUG] Data input alterada:', e.target.value);
                  setFormData({...formData, date: e.target.value});
                }}
              />
            </div>

            {/* Time Slot Selector */}
            <TimeSlotSelector
              selectedDate={formData.date}
              selectedProfessional={formData.professional}
              selectedService={formData.service}
              onTimeSelect={(time) => {
                console.log('🔍 [DEBUG] Horário selecionado:', time);
                setFormData({...formData, time: time});
              }}
              selectedTime={formData.time}
            />

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Observações adicionais sobre o agendamento..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-green-500"
          >
            {loading ? (editingAppointment ? "Atualizando..." : "Criando...") : (editingAppointment ? "Atualizar Agendamento" : "Criar Agendamento")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentModalWithDB;
