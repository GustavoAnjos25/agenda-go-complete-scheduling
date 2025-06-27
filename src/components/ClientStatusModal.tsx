
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Tag } from 'lucide-react';

interface ClientStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onUpdateStatus: (clientId: number, newTags: string[]) => void;
}

const ClientStatusModal = ({ isOpen, onClose, client, onUpdateStatus }: ClientStatusModalProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(client?.tags || []);

  const availableTags = [
    'VIP',
    'Fidelizada',
    'Novo',
    'Regular',
    'Indicadora',
    'Pontual',
    'Cancelou Recentemente',
    'Pré-Pagamento'
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (client) {
      onUpdateStatus(client.id, selectedTags);
      onClose();
    }
  };

  const getTagColor = (tag: string) => {
    const colors = {
      'VIP': 'bg-purple-100 text-purple-800',
      'Fidelizada': 'bg-green-100 text-green-800',
      'Novo': 'bg-blue-100 text-blue-800',
      'Regular': 'bg-gray-100 text-gray-800',
      'Indicadora': 'bg-orange-100 text-orange-800',
      'Pontual': 'bg-teal-100 text-teal-800',
      'Cancelou Recentemente': 'bg-red-100 text-red-800',
      'Pré-Pagamento': 'bg-yellow-100 text-yellow-800'
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Status do Cliente
          </DialogTitle>
          <DialogDescription>
            Gerenciar tags e status de {client.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Tags Atuais:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Badge key={tag} className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">Nenhuma tag selecionada</span>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Selecionar Tags:</Label>
            <div className="space-y-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <Label htmlFor={tag} className="text-sm cursor-pointer">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-green-500">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientStatusModal;
