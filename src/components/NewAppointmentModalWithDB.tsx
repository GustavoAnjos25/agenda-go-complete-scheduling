
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Scissors } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import TimeSlotSelector from './TimeSlotSelector';

interface NewAppointmentModalWithDBProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const NewAppointmentModalWithDB = ({ isOpen, onClose, onSave }: NewAppointmentModalWithDBProps) => {
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
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      loadServices();
      loadProfessionals();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (formData.professional) {
      loadServicesByProfessional(formData.professional);
    } else {
      setFilteredServices(services);
    }
  }, [formData.professional, services]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('status', 'active')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const loadServicesByProfessional = async (professionalId: string) => {
    try {
      const { data, error } = await supabase
        .from('professional_services')
        .select(`
          services (*)
        `)
        .eq('professional_id', professionalId);

      if (error) throw error;
      
      const professionalServices = data?.map(ps => ps.services).filter(Boolean) || [];
      setFilteredServices(professionalServices);
      
      // Limpar serviço selecionado se não estiver mais disponível
      if (formData.service && !professionalServices.find(s => s.id === formData.service)) {
        setFormData(prev => ({ ...prev, service: '' }));
      }
    } catch (error) {
      console.error('Erro ao carregar serviços do profissional:', error);
      setFilteredServices([]);
    }
  };

  const handleSave = async () => {
    if (!formData.clientName || !formData.service || !formData.professional || !formData.date || !formData.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar se a data não é anterior ao dia atual
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast({
        title: "Data inválida",
        description: "Não é possível agendar para datas passadas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Primeiro, criar ou buscar cliente
      let clientId;
      
      // Verificar se cliente já existe pelo email (se fornecido) ou nome
      const { data: existingClients, error: searchError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .or(`email.eq.${formData.clientEmail || 'null'},name.eq.${formData.clientName}`);

      if (searchError) throw searchError;

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
        
        // Atualizar contador de visitas
        const { error: updateError } = await supabase
          .from('clients')
          .update({ 
            total_visits: await getCurrentVisitCount(clientId) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);

        if (updateError) console.error('Erro ao atualizar visitas:', updateError);
      } else {
        // Criar novo cliente
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([{
            name: formData.clientName,
            email: formData.clientEmail || null,
            phone: formData.clientPhone || null,
            user_id: user.id,
            total_visits: 1
          }])
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Criar agendamento (removido o total_price que não existe na tabela)
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

      toast({
        title: "Agendamento criado!",
        description: `Agendamento para ${formData.clientName} foi criado com sucesso`,
      });

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
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro ao criar agendamento",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentVisitCount = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('client_id', clientId)
        .eq('status', 'completed');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Erro ao contar visitas:', error);
      return 0;
    }
  };

  // Definir data mínima como hoje
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento
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
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    placeholder="(11) 99999-9999"
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
                <Select value={formData.professional} onValueChange={(value) => setFormData({...formData, professional: value, service: ''})}>
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
                <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
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

            <div>
              <Label htmlFor="date">Data*</Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            {/* Time Slot Selector */}
            <TimeSlotSelector
              selectedDate={formData.date}
              selectedProfessional={formData.professional}
              selectedService={formData.service}
              onTimeSelect={(time) => setFormData({...formData, time: time})}
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
            {loading ? "Criando..." : "Criar Agendamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentModalWithDB;
