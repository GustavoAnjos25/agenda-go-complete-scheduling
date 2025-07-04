
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Edit, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppointmentActionsProps {
  appointmentId: string;
  currentStatus: string;
  onStatusChange: () => void;
  onEdit: () => void;
}

type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

const AppointmentActions = ({ appointmentId, currentStatus, onStatusChange, onEdit }: AppointmentActionsProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateAppointmentStatus = async (newStatus: AppointmentStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Agendamento ${getStatusLabel(newStatus).toLowerCase()}`,
      });

      onStatusChange();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Confirmar Presença */}
      {currentStatus !== 'confirmed' && currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateAppointmentStatus('confirmed')}
          disabled={loading}
          className="text-green-600 border-green-300 hover:bg-green-50"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Confirmar
        </Button>
      )}

      {/* Marcar como Concluído */}
      {(currentStatus === 'confirmed' || currentStatus === 'scheduled') && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateAppointmentStatus('completed')}
          disabled={loading}
          className="text-purple-600 border-purple-300 hover:bg-purple-50"
        >
          <Clock className="w-4 h-4 mr-1" />
          Concluir
        </Button>
      )}

      {/* Cancelar */}
      {currentStatus !== 'cancelled' && currentStatus !== 'completed' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Não cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => updateAppointmentStatus('cancelled')}
                className="bg-red-600 hover:bg-red-700"
              >
                Sim, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Editar */}
      <Button
        size="sm"
        variant="outline"
        onClick={onEdit}
        disabled={loading || currentStatus === 'cancelled'}
        className="text-blue-600 border-blue-300 hover:bg-blue-50"
      >
        <Edit className="w-4 h-4 mr-1" />
        Editar
      </Button>
    </div>
  );
};

export default AppointmentActions;
