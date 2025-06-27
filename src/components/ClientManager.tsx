import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Plus, Phone, Mail, Calendar, MessageSquare } from 'lucide-react';

interface ClientManagerProps {
  onNavigate?: (tab: string) => void;
}

const ClientManager = ({ onNavigate }: ClientManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  const clients = [
    {
      id: 1,
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
      phone: '(11) 99999-9999',
      lastVisit: '2024-01-15',
      totalVisits: 8,
      tags: ['VIP', 'Fidelizada'],
      preferredServices: ['Corte', 'Escova'],
      notes: 'Prefere agendamentos pela manhã'
    },
    {
      id: 2,
      name: 'João Santos',
      email: 'joao.santos@email.com',
      phone: '(11) 88888-8888',
      lastVisit: '2024-01-10',
      totalVisits: 3,
      tags: ['Novo'],
      preferredServices: ['Barba', 'Cabelo'],
      notes: 'Cliente pontual, sempre confirma presença'
    },
    {
      id: 3,
      name: 'Isabella Oliveira',
      email: 'isabella.oliveira@email.com',
      phone: '(11) 77777-7777',
      lastVisit: '2024-01-20',
      totalVisits: 15,
      tags: ['VIP', 'Indicadora'],
      preferredServices: ['Manicure', 'Pedicure'],
      notes: 'Sempre traz amigas, excelente cliente'
    },
    {
      id: 4,
      name: 'Pedro Almeida',
      email: 'pedro.almeida@email.com',
      phone: '(11) 66666-6666',
      lastVisit: '2024-01-12',
      totalVisits: 5,
      tags: ['Regular'],
      preferredServices: ['Massagem'],
      notes: 'Prefere horários após 16h'
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const getTagColor = (tag: string) => {
    const colors = {
      'VIP': 'bg-purple-100 text-purple-800',
      'Fidelizada': 'bg-green-100 text-green-800',
      'Novo': 'bg-blue-100 text-blue-800',
      'Regular': 'bg-gray-100 text-gray-800',
      'Indicadora': 'bg-orange-100 text-orange-800'
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleSaveClient = () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      alert('Por favor, preencha os campos obrigatórios (Nome, Email e Telefone)');
      return;
    }
    
    alert(`Cliente ${newClient.name} cadastrado com sucesso!`);
    setNewClient({ name: '', email: '', phone: '', notes: '' });
    setIsDialogOpen(false);
  };

  const handleClientAction = (action: string, clientName: string) => {
    switch (action) {
      case 'message':
        alert(`Enviando mensagem para ${clientName}...`);
        break;
      case 'schedule':
        onNavigate?.('calendar');
        alert(`Redirecionando para agenda para ${clientName}...`);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Clientes</h1>
          <p className="text-gray-600">Gerencie todos os seus clientes em um só lugar</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha as informações do cliente para começar o cadastro.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome*</Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email*</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="col-span-3" 
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Telefone*</Label>
                <Input 
                  id="phone" 
                  className="col-span-3" 
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Observações</Label>
                <Textarea 
                  id="notes" 
                  className="col-span-3" 
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-green-500"
                onClick={handleSaveClient}
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-800">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Badge className="bg-purple-100 text-purple-800 mr-2">VIP</Badge>
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes VIP</p>
                <p className="text-2xl font-bold text-gray-800">
                  {clients.filter(c => c.tags.includes('VIP')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Badge className="bg-blue-100 text-blue-800 mr-2">Novos</Badge>
              <div>
                <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                <p className="text-2xl font-bold text-gray-800">
                  {clients.filter(c => c.tags.includes('Novo')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Média de Visitas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(clients.reduce((acc, c) => acc + c.totalVisits, 0) / clients.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Lista de Clientes
          </CardTitle>
          <CardDescription>
            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-800">{client.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {client.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {client.phone}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {client.tags.map((tag) => (
                        <Badge key={tag} className={getTagColor(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <p className="text-gray-600">{client.totalVisits} visitas</p>
                    <p className="text-gray-500">Última: {client.lastVisit}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleClientAction('message', client.name)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleClientAction('schedule', client.name)}
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientManager;
