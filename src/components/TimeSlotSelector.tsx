
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

  const generateTimeSlots = (startTime, endTime, duration, bookedSlots) => {
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

  const isPastTime = (time) => {
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
      // Buscar disponibilidade do profissional
      const dayOfWeek = new Date(selectedDate).getDay();
      const { data: availability } = await supabase
        .from('professional_availability')
        .select('start_time, end_time')
        .eq('professional_id', selectedProfessional)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .single();

      if (!availability) {
        setAvailableSlots([]);
        return;
      }

      // Buscar duração do serviço
      const { data: service } = await supabase
        .from('services')
        .select('duration')
        .eq('id', selectedService)
        .single();

      // Buscar agendamentos já marcados
      const { data: appointments } = await supabase
        .from('appointments')
        .select('time')
        .eq('professional_id', selectedProfessional)
        .eq('date', selectedDate)
        .neq('status', 'cancelled');

      const bookedSlots = appointments?.map(apt => apt.time) || [];
      const duration = service?.duration || 30;

      const slots = generateTimeSlots(
        availability.start_time,
        availability.end_time,
        duration,
        bookedSlots
      );

      setAvailableSlots(slots);
    } catch (error) {
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
          <p className="text-gray-500">Nenhum horário disponível para esta data</p>
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
