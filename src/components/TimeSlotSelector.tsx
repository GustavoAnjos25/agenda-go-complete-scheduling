
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  selectedTime 
}: TimeSlotSelectorProps) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateTimeSlots = (startTime: string, endTime: string, duration: number, bookedSlots: string[]) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    while (start < end) {
      const timeString = start.toTimeString().substring(0, 5);
      const isBooked = bookedSlots.includes(timeString);
      const isPast = isPastTime(timeString);
      
      if (!isBooked && !isPast) {
        slots.push(timeString);
      }
      
      start.setMinutes(start.getMinutes() + duration);
    }
    
    return slots;
  };

  const isPastTime = (time: string) => {
    if (!selectedDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return false;
    
    const now = new Date();
    const appointmentTime = new Date(`${selectedDate}T${time}`);
    return appointmentTime <= now;
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedProfessional || !selectedService) {
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    try {
      // Buscar disponibilidade do profissional para o dia da semana selecionado
      const selectedDateObj = new Date(selectedDate);
      const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      console.log('Buscando disponibilidade para:', {
        professional_id: selectedProfessional,
        day_of_week: dayOfWeek,
        date: selectedDate
      });

      const { data: availability, error: availabilityError } = await supabase
        .from('professional_availability')
        .select('start_time, end_time, is_available')
        .eq('professional_id', selectedProfessional)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (availabilityError) {
        console.error('Erro ao buscar disponibilidade:', availabilityError);
        throw availabilityError;
      }

      console.log('Disponibilidade encontrada:', availability);

      if (!availability || availability.length === 0) {
        console.log('Nenhuma disponibilidade encontrada para este dia');
        setAvailableSlots([]);
        return;
      }

      // Pegar a primeira disponibilidade (assumindo que há apenas uma por dia)
      const dayAvailability = availability[0];

      // Buscar duração do serviço
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('duration')
        .eq('id', selectedService)
        .single();

      if (serviceError) {
        console.error('Erro ao buscar serviço:', serviceError);
        throw serviceError;
      }

      console.log('Serviço encontrado:', service);

      // Buscar agendamentos já marcados para este profissional nesta data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('time')
        .eq('professional_id', selectedProfessional)
        .eq('date', selectedDate)
        .neq('status', 'cancelled');

      if (appointmentsError) {
        console.error('Erro ao buscar agendamentos:', appointmentsError);
        throw appointmentsError;
      }

      console.log('Agendamentos existentes:', appointments);

      const bookedSlots = appointments?.map(apt => apt.time) || [];
      const duration = service?.duration || 30;

      console.log('Gerando slots com:', {
        start_time: dayAvailability.start_time,
        end_time: dayAvailability.end_time,
        duration,
        bookedSlots
      });

      const slots = generateTimeSlots(
        dayAvailability.start_time,
        dayAvailability.end_time,
        duration,
        bookedSlots
      );

      console.log('Slots gerados:', slots);
      setAvailableSlots(slots);

    } catch (error) {
      console.error('Erro completo ao carregar horários:', error);
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
          <p className="text-gray-500">Selecione a data, profissional e serviço primeiro</p>
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
