
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DayAvailabilityCard from './availability/DayAvailabilityCard';
import { daysOfWeek, initializeAvailability } from './availability/AvailabilityUtils';
import { AvailabilityService } from './availability/AvailabilityService';

interface ProfessionalAvailabilityManagerProps {
  professionalId: string;
  professionalName: string;
  onClose: () => void;
  open: boolean;
}

const ProfessionalAvailabilityManager = ({ 
  professionalId, 
  professionalName, 
  onClose,
  open
}: ProfessionalAvailabilityManagerProps) => {
  const [availability, setAvailability] = useState([]);
  const [modifiedDays, setModifiedDays] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailability();
  }, [professionalId]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const data = await AvailabilityService.loadAvailability(professionalId);
      const initialAvailability = initializeAvailability(data, professionalId);
      setAvailability(initialAvailability);
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
      toast({
        title: "Erro ao carregar disponibilidade",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDayAvailability = (dayOfWeek: number, field: string, value: any) => {
    console.log('Atualizando disponibilidade:', {
      dayOfWeek,
      dayName: daysOfWeek.find(d => d.id === dayOfWeek)?.name,
      field,
      value
    });
    
    // Marcar este dia como modificado
    setModifiedDays(prev => new Set([...prev, dayOfWeek]));
    
    setAvailability(prev => prev.map((day) => 
      day.day_of_week === dayOfWeek ? { ...day, [field]: value } : day
    ));
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // Salvar apenas os dias que foram modificados
      const daysToSave = availability.filter(day => modifiedDays.has(day.day_of_week));
      
      console.log('Salvando apenas os dias modificados:', daysToSave.map(d => ({
        day_of_week: d.day_of_week,
        dayName: daysOfWeek.find(dd => dd.id === d.day_of_week)?.name
      })));
      
      for (const day of daysToSave) {
        await AvailabilityService.saveDayAvailability(professionalId, day);
      }

      toast({
        title: "Disponibilidade salva!",
        description: `Horários de ${professionalName} atualizados com sucesso`,
      });

      // Limpar dias modificados após salvar
      setModifiedDays(new Set());
      onClose();
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
      toast({
        title: "Erro ao salvar disponibilidade",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Disponibilidade - {professionalName}
          </DialogTitle>
          <DialogDescription>
            Configure os horários de trabalho para cada dia da semana
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center">
            <p>Carregando disponibilidade...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4">
              {availability.map((day) => {
                const dayInfo = daysOfWeek.find(d => d.id === day.day_of_week);
                return (
                  <DayAvailabilityCard
                    key={day.day_of_week}
                    day={day}
                    dayInfo={dayInfo}
                    onUpdate={updateDayAvailability}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700">
                Cada dia da semana é salvo individualmente. As alterações só afetam o dia selecionado.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={saveAvailability} 
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-green-500"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Disponibilidade"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalAvailabilityManager;
