import { supabase } from '@/integrations/supabase/client';
import { daysOfWeek } from './AvailabilityUtils';

export class AvailabilityService {
  static async loadAvailability(professionalId: string) {
    const { data, error } = await supabase
      .from('professional_availability')
      .select('*')
      .eq('professional_id', professionalId)
      .order('day_of_week');

    if (error) throw error;
    return data || [];
  }

  static async saveDayAvailability(professionalId: string, day: any) {
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
}