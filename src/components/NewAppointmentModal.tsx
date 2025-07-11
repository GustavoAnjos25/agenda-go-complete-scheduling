import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Scissors } from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
}

const NewAppointmentModal = ({ isOpen, onClose, onSave }: NewAppointmentModalProps) => {
  const [formData, setFormData] = useState({
    client: '',
    service: '',
    professional: '',
    date: '',
    time: '',
    duration: '30',
    notes: ''
  });

  const services = [
    'Corte + Escova',
    'Barba + Cabelo',
    'Manicure',
    'Pedicure',
    'Massagem Relaxante',
    'Limpeza de Pele',
    'Sobrancelha'
  ];

  const professionals = [
    'Ana Costa',
    'Carlos Souza',
    'Fernanda Lima',
    'Ricardo Mendes'
  ];

  const handleSave = () => {
    if (!formData.client || !formData.service || !formData.professional || !formData.date || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const newAppointment = {
      id: Date.now(),
      client: formData.client,
      service: formData.service,
      professional: formData.professional,
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration),
      notes: formData.notes,
      status: 'pending',
      price: Math.floor(Math.random() * 100) + 50
    };

    onSave(newAppointment);
    setFormData({
      client: '',
      service: '',
      professional: '',
      date: '',
      time: '',
      duration: '30',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">Cliente*</Label>
            <Input
              id="client"
              className="col-span-3"
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
              placeholder="Nome do cliente"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service" className="text-right">Serviço*</Label>
            <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="professional" className="text-right">Profissional*</Label>
            <Select value={formData.professional} onValueChange={(value) => setFormData({...formData, professional: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((professional) => (
                  <SelectItem key={professional} value={professional}>{professional}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Data*</Label>
            <Input
              id="date"
              type="date"
              className="col-span-3"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">Horário*</Label>
            <Input
              id="time"
              type="time"
              className="col-span-3"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duração</Label>
            <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h 30min</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">Observações</Label>
            <Textarea
              id="notes"
              className="col-span-3"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observações adicionais..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-green-500">
            Salvar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentModal;
