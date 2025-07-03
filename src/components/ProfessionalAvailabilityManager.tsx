
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalAvailabilityManagerProps {
  professionalId: string;
  professionalName: string;
  onClose: () => void;
}

const ProfessionalAvailabilityManager = ({ 
  professionalId, 
  professionalName, 
  onClose 
}: ProfessionalAvailabilityManagerProps) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const daysOfWeek = [
    { id: 0, name: 'Domingo', short: 'Dom' },
    { id: 1, name: 'Segunda-feira', short: 'Seg' },
    { id: 2, name: 'Terça-feira', short: 'Ter' },
    { id: 3, name: 'Quarta-feira', short: 'Qua' },
    { id: 4, name: 'Quinta-feira', short: 'Qui' },
    { id: 5, name: 'Sexta-feira', short: 'Sex' },
    { id: 6, name: 'Sábado', short: 'Sáb' }
  ];

  useEffect(() => {
    loadAvailability();
  }, [professionalId]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', professionalId)
        .order('day_of_week');

      if (error) throw error;

      // Inicializar disponibilidade para todos os dias se não existir
      const existingDays = data?.map(item => item.day_of_week) || [];
      const initialAvailability = daysOfWeek.map(day => {
        const existing = data?.find(item => item.day_of_week === day.id);
        return existing || {
          day_of_week: day.id,
          professional_id: professionalId,
          is_available: false,
          start_time: '09:00',
          end_time: '18:00'
        };
      });

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
    
    setAvailability(prev => prev.map((day) => 
      day.day_of_week === dayOfWeek ? { ...day, [field]: value } : day
    ));
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // Salvar cada dia individualmente
      for (const day of availability) {
        console.log('Salvando dia:', {
          day_of_week: day.day_of_week,
          dayName: daysOfWeek.find(d => d.id === day.day_of_week)?.name,
          is_available: day.is_available,
          start_time: day.start_time,
          end_time: day.end_time
        });
        
        // Primeiro verificar se já existe um registro para este dia
        const { data: existing, error: selectError } = await supabase
          .from('professional_availability')
          .select('id')
          .eq('professional_id', professionalId)
          .eq('day_of_week', day.day_of_week)
          .maybeSingle();

        if (selectError) {
          console.error('Erro ao verificar dia existente:', selectError);
          throw selectError;
        }

        if (day.is_available) {
          // Se o dia está marcado como disponível, inserir ou atualizar
          if (existing) {
            // Atualizar registro existente
            console.log('Atualizando registro existente para:', {
              day_of_week: day.day_of_week,
              dayName: daysOfWeek.find(d => d.id === day.day_of_week)?.name
            });
            
            const { error: updateError } = await supabase
              .from('professional_availability')
              .update({
                is_available: day.is_available,
                start_time: day.start_time,
                end_time: day.end_time
              })
              .eq('id', existing.id);

            if (updateError) {
              console.error('Erro ao atualizar disponibilidade:', updateError);
              throw updateError;
            }
          } else {
            // Inserir novo registro
            console.log('Inserindo novo registro para:', {
              day_of_week: day.day_of_week,
              dayName: daysOfWeek.find(d => d.id === day.day_of_week)?.name
            });
            
            const { error: insertError } = await supabase
              .from('professional_availability')
              .insert({
                professional_id: professionalId,
                day_of_week: day.day_of_week,
                is_available: day.is_available,
                start_time: day.start_time,
                end_time: day.end_time
              });

            if (insertError) {
              console.error('Erro ao inserir disponibilidade:', insertError);
              throw insertError;
            }
          }
        } else {
          // Se o dia não está disponível, remover registro se existir
          if (existing) {
            const { error: deleteError } = await supabase
              .from('professional_availability')
              .delete()
              .eq('id', existing.id);

            if (deleteError) {
              console.error('Erro ao remover disponibilidade:', deleteError);
              throw deleteError;
            }
          }
        }
      }

      toast({
        title: "Disponibilidade salva!",
        description: `Horários de ${professionalName} atualizados com sucesso`,
      });

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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Carregando disponibilidade...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Disponibilidade - {professionalName}
        </CardTitle>
        <CardDescription>
          Configure os horários de trabalho para cada dia da semana
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {availability.map((day, dayIndex) => {
            const dayInfo = daysOfWeek.find(d => d.id === day.day_of_week);
            return (
              <div key={day.day_of_week} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16">
                    <Badge variant="outline" className="text-xs">
                      {dayInfo?.short}
                    </Badge>
                  </div>
                  <div className="w-32">
                    <p className="font-medium text-sm">{dayInfo?.name}</p>
                  </div>
                   <Switch
                    checked={day.is_available}
                    onCheckedChange={(checked) => 
                      updateDayAvailability(day.day_of_week, 'is_available', checked)
                    }
                  />
                </div>
                
                {day.is_available && (
                  <div className="flex items-center space-x-2">
                    <div>
                      <Label htmlFor={`start-${day.day_of_week}`} className="text-xs">
                        Início
                      </Label>
                      <Input
                        id={`start-${day.day_of_week}`}
                        type="time"
                        value={day.start_time}
                        onChange={(e) => 
                          updateDayAvailability(day.day_of_week, 'start_time', e.target.value)
                        }
                        className="w-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`end-${day.day_of_week}`} className="text-xs">
                        Fim
                      </Label>
                      <Input
                        id={`end-${day.day_of_week}`}
                        type="time"
                        value={day.end_time}
                        onChange={(e) => 
                          updateDayAvailability(day.day_of_week, 'end_time', e.target.value)
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                )}
              </div>
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
      </CardContent>
    </Card>
  );
};

export default ProfessionalAvailabilityManager;
