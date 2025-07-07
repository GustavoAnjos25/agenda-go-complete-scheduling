import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimeSlotSelectorProps {
  selectedDate: string;
  selectedProfessional: string;
  selectedService: string;
  onTimeSelect: (time: string) => void;
  selectedTime: string;
}

const TimeSlotSelector = ({
  selectedDate,
  selectedProfessional,
  selectedService,
  onTimeSelect,
  selectedTime,
}: TimeSlotSelectorProps) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ✅ FUNÇÃO HELPER - Para criar Date object corretamente
  const createDateFromString = (dateString: string) => {
    if (!dateString) return null;

    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (isNaN(date.getTime())) {
      console.error("Data inválida:", dateString);
      return null;
    }

    return date;
  };

  // ✅ FUNÇÃO HELPER - Para formatar data atual sem problemas de fuso horário
  const formatDateForInput = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    duration: number,
    blockedSlots: string[],
  ) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    while (start < end) {
      const timeString = start.toTimeString().substring(0, 5);
      const isPast = isPastTime(timeString);
      const isBlocked = isTimeBlocked(timeString, duration, blockedSlots);

      if (!isPast && !isBlocked) {
        slots.push(timeString);
      }

      start.setMinutes(start.getMinutes() + 30); // Intervalos de 30 minutos
    }

    return slots;
  };

  // ✅ FUNÇÃO CORRIGIDA - isPastTime sem problemas de fuso horário
  const isPastTime = (time: string) => {
    if (!selectedDate) return false;

    const today = formatDateForInput();
    if (selectedDate !== today) return false;

    const now = new Date();

    // Criar data do agendamento corretamente
    const [year, month, day] = selectedDate.split("-");
    const appointmentTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(time.split(":")[0]),
      parseInt(time.split(":")[1]),
    );

    return appointmentTime <= now;
  };

  const isTimeBlocked = (
    proposedTime: string,
    serviceDuration: number,
    blockedSlots: string[],
  ) => {
    const proposedStart = new Date(`2000-01-01T${proposedTime}`);
    const proposedEnd = new Date(
      proposedStart.getTime() + serviceDuration * 60000,
    );

    return blockedSlots.some((blockedTime) => {
      const [time, duration] = blockedTime.split("|");
      const blockedStart = new Date(`2000-01-01T${time}`);
      const blockedEnd = new Date(
        blockedStart.getTime() + parseInt(duration) * 60000,
      );

      // Verifica se há sobreposição
      return proposedStart < blockedEnd && proposedEnd > blockedStart;
    });
  };

  // ✅ FUNÇÃO PRINCIPAL CORRIGIDA
  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedProfessional || !selectedService) {
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    try {
      // Função para calcular dayOfWeek corretamente
      const calculateDayOfWeek = (dateString: string) => {
        if (!dateString) return null;

        const [year, month, day] = dateString.split("-");
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );

        if (isNaN(date.getTime())) {
          console.error("Data inválida:", dateString);
          return null;
        }

        return date.getDay();
      };

      const dayOfWeek = calculateDayOfWeek(selectedDate);

      // Validação crítica - evita o erro 22P02
      if (dayOfWeek === null || isNaN(dayOfWeek)) {
        console.error("dayOfWeek inválido:", dayOfWeek);
        setAvailableSlots([]);
        return;
      }

      // Criar objeto Date corretamente para logs
      const selectedDateObj = createDateFromString(selectedDate);

      console.log("🔍 DIAGNÓSTICO COMPLETO - Buscando disponibilidade:", {
        selectedDate,
        selectedDateObj: selectedDateObj?.toString(),
        dayOfWeek,
        dayName: [
          "Domingo",
          "Segunda-feira",
          "Terça-feira",
          "Quarta-feira",
          "Quinta-feira",
          "Sexta-feira",
          "Sábado",
        ][dayOfWeek],
        professional_id: selectedProfessional,
      });

      const { data: availability, error: availabilityError } = await supabase
        .from("professional_availability")
        .select("start_time, end_time, is_available, day_of_week")
        .eq("professional_id", selectedProfessional)
        .eq("day_of_week", dayOfWeek)
        .eq("is_available", true);

      if (availabilityError) {
        console.error("Erro ao buscar disponibilidade:", availabilityError);
        throw availabilityError;
      }

      console.log("📊 RESULTADO DA CONSULTA:", {
        queryDayOfWeek: dayOfWeek,
        queryDayName: [
          "Domingo",
          "Segunda-feira",
          "Terça-feira",
          "Quarta-feira",
          "Quinta-feira",
          "Sexta-feira",
          "Sábado",
        ][dayOfWeek],
        foundRecords: availability?.length || 0,
        records: availability?.map((a) => ({
          day_of_week: a.day_of_week,
          dayName: [
            "Domingo",
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado",
          ][a.day_of_week],
          start_time: a.start_time,
          end_time: a.end_time,
        })),
      });

      if (!availability || availability.length === 0) {
        console.log("Nenhuma disponibilidade encontrada para este dia");
        setAvailableSlots([]);
        return;
      }

      const dayAvailability = availability[0];

      // Buscar duração do serviço
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("duration")
        .eq("id", selectedService)
        .single();

      if (serviceError) {
        console.error("Erro ao buscar serviço:", serviceError);
        throw serviceError;
      }

      console.log("Serviço encontrado:", service);

      // Buscar agendamentos já marcados com suas durações
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(
          `
          time,
          services (duration)
        `,
        )
        .eq("professional_id", selectedProfessional)
        .eq("date", selectedDate)
        .neq("status", "cancelled");

      if (appointmentsError) {
        console.error("Erro ao buscar agendamentos:", appointmentsError);
        throw appointmentsError;
      }

      console.log("Agendamentos existentes:", appointments);

      // Criar lista de horários bloqueados com duração
      const blockedSlots =
        appointments?.map(
          (apt) => `${apt.time}|${apt.services?.duration || 30}`,
        ) || [];

      const duration = service?.duration || 30;

      console.log("Gerando slots com:", {
        start_time: dayAvailability.start_time,
        end_time: dayAvailability.end_time,
        duration,
        blockedSlots,
      });

      const slots = generateTimeSlots(
        dayAvailability.start_time,
        dayAvailability.end_time,
        duration,
        blockedSlots,
      );

      console.log("Slots gerados:", slots);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Erro completo ao carregar horários:", error);
      toast({
        title: "Erro ao carregar horários",
        description: "Tente novamente",
        variant: "destructive",
      });
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableSlots();
  }, [selectedDate, selectedProfessional, selectedService]);

  if (!selectedDate || !selectedProfessional || !selectedService) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Horários Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Selecione a data, profissional e serviço primeiro
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários Disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-500">Carregando horários...</p>
        ) : availableSlots.length === 0 ? (
          <p className="text-gray-500">Nenhum horário disponível para esta data. Verifique se o profissional tem disponibilidade configurada para este dia da semana.</p>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {availableSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeSelect(time)}
                className="text-xs"
              >
                {time}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotSelector;
