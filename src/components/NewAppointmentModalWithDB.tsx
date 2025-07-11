import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TimeSlotSelector from "./TimeSlotSelector";
import PhoneInput from "./PhoneInput";
import ServiceInfoDisplay from "./ServiceInfoDisplay";

interface NewAppointmentModalWithDBProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingAppointment?: any;
  onDateChange?: (dateString: string) => void; // ✅ Adicione
}

const NewAppointmentModalWithDB = ({
  isOpen,
  onClose,
  onSave,
  editingAppointment,
  onDateChange,
}: NewAppointmentModalWithDBProps) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    service: "",
    professional: "",
    date: "",
    time: "",
    notes: "",
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
      console.log("Carregando dados para edição:", editingAppointment);
      setFormData({
        clientName: editingAppointment.client || "",
        clientEmail: editingAppointment.clientEmail || "",
        clientPhone: editingAppointment.clientPhone || "",
        service: editingAppointment.service_id || "",
        professional: editingAppointment.professional_id || "",
        date: editingAppointment.date || "",
        time: editingAppointment.time || "",
        notes: editingAppointment.notes || "",
      });
    } else if (!editingAppointment && isOpen) {
      // Resetar form para novo agendamento
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        service: "",
        professional: "",
        date: "",
        time: "",
        notes: "",
      });
      setSelectedServiceInfo(null);
    }
  }, [editingAppointment, isOpen]);

  useEffect(() => {
    if (formData.professional) {
      loadServicesByProfessional(formData.professional);
    } else {
      setFilteredServices(services);
    }
  }, [formData.professional, services]);

  // Atualizar informações do serviço quando selecionado
  useEffect(() => {
    if (formData.service) {
      const service = filteredServices.find((s) => s.id === formData.service);
      setSelectedServiceInfo(service);
    } else {
      setSelectedServiceInfo(null);
    }
  }, [formData.service, filteredServices]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (error) throw error;
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  };

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("status", "active")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  // ✅ Adicione esta função para debug
  const handleDateChange = (dateString) => {
    console.log("Data selecionada (string):", dateString);

    // Criar Date object corretamente
    const [year, month, day] = dateString.split("-");
    const dateObj = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );

    console.log("Data selecionada (objeto):", dateObj);
    console.log(
      "Dia da semana:",
      dateObj.toLocaleDateString("pt-BR", { weekday: "long" }),
    );

    setFormData({ ...formData, date: dateString });

    // Notificar o componente pai
    if (onDateChange) {
      onDateChange(dateString);
    }
  };

  const loadServicesByProfessional = async (professionalId: string) => {
    try {
      const { data, error } = await supabase
        .from("professional_services")
        .select(
          `
          services (*)
        `,
        )
        .eq("professional_id", professionalId);

      if (error) throw error;

      const professionalServices =
        data?.map((ps) => ps.services).filter(Boolean) || [];
      setFilteredServices(professionalServices);

      // Limpar serviço selecionado se não estiver mais disponível
      if (
        formData.service &&
        !professionalServices.find((s) => s.id === formData.service)
      ) {
        setFormData((prev) => ({ ...prev, service: "" }));
      }
    } catch (error) {
      console.error("Erro ao carregar serviços do profissional:", error);
      setFilteredServices([]);
    }
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length === 10 || numbers.length === 11;
  };

  const handleSave = async () => {
    if (
      !formData.clientName ||
      !formData.service ||
      !formData.professional ||
      !formData.date ||
      !formData.time
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (formData.clientPhone && !validatePhone(formData.clientPhone)) {
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

    if (selectedDate < today) {
      toast({
        title: "Data inválida",
        description: "Não é possível agendar para datas passadas",
        variant: "destructive",
      });
      return;
    }

    // Validar se o horário não é anterior ao atual (apenas para hoje)
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const [hours, minutes] = formData.time.split(':');
      const appointmentTime = new Date(selectedDate);
      appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (appointmentTime <= now) {
        toast({
          title: "Horário inválido",
          description: "Não é possível agendar para horários que já passaram",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      let clientId;

      if (editingAppointment) {
        // Para edição, usar o cliente existente
        clientId = editingAppointment.client_id;

        // Atualizar dados do cliente
        const { error: updateClientError } = await supabase
          .from("clients")
          .update({
            name: formData.clientName,
            email: formData.clientEmail || null,
            phone: formData.clientPhone || null,
          })
          .eq("id", clientId);

        if (updateClientError) throw updateClientError;

        // Atualizar agendamento
        const { error: updateAppointmentError } = await supabase
          .from("appointments")
          .update({
            service_id: formData.service,
            professional_id: formData.professional,
            date: formData.date,
            time: formData.time,
            notes: formData.notes || null,
          })
          .eq("id", editingAppointment.id);

        if (updateAppointmentError) throw updateAppointmentError;

        toast({
          title: "Agendamento atualizado!",
          description: `Agendamento de ${formData.clientName} foi atualizado com sucesso`,
        });
      } else {
        // Para novo agendamento
        // Verificar se cliente já existe pelo email (se fornecido) ou nome
        const { data: existingClients, error: searchError } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .or(
            `email.eq.${formData.clientEmail || "null"},name.eq.${formData.clientName}`,
          );

        if (searchError) throw searchError;

        if (existingClients && existingClients.length > 0) {
          clientId = existingClients[0].id;
        } else {
          // Criar novo cliente
          const { data: newClient, error: clientError } = await supabase
            .from("clients")
            .insert([
              {
                name: formData.clientName,
                email: formData.clientEmail || null,
                phone: formData.clientPhone || null,
                user_id: user.id,
              },
            ])
            .select()
            .single();

          if (clientError) throw clientError;
          clientId = newClient.id;
        }

        // Criar agendamento
        const { error: appointmentError } = await supabase
          .from("appointments")
          .insert([
            {
              client_id: clientId,
              service_id: formData.service,
              professional_id: formData.professional,
              date: formData.date,
              time: formData.time,
              notes: formData.notes || null,
              status: "scheduled",
              user_id: user.id,
            },
          ]);

        if (appointmentError) throw appointmentError;

        toast({
          title: "Agendamento criado!",
          description: `Agendamento para ${formData.clientName} foi criado com sucesso`,
        });
      }

      // Reset form
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        service: "",
        professional: "",
        date: "",
        time: "",
        notes: "",
      });
      setSelectedServiceInfo(null);

      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
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
  const formatDateForInput = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = formatDateForInput();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {editingAppointment
              ? "Edite os dados do agendamento"
              : "Preencha os dados para criar um novo agendamento"}
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
                  onChange={(e) => {
                    e.stopPropagation(); // Evita propagação
                    setFormData({ ...formData, clientName: e.target.value });
                  }}
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
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Telefone</Label>
                  <PhoneInput
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(value) =>
                      setFormData({ ...formData, clientPhone: value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Agendamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">
              Dados do Agendamento
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="professional">Profissional*</Label>
                <Select
                  value={formData.professional}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      professional: value,
                      service: "",
                    })
                  }
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, service: value })
                  }
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
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            {/* Time Slot Selector */}
            <TimeSlotSelector
              selectedDate={formData.date}
              selectedProfessional={formData.professional}
              selectedService={formData.service}
              onTimeSelect={(time) => setFormData({ ...formData, time: time })}
              selectedTime={formData.time}
            />

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
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
            {loading
              ? editingAppointment
                ? "Atualizando..."
                : "Criando..."
              : editingAppointment
                ? "Atualizar Agendamento"
                : "Criar Agendamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentModalWithDB;
