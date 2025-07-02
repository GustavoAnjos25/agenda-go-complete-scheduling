
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Search, Phone, Mail, Calendar, MessageSquare, Settings, History } from 'lucide-react';
import ClientStatusModal from './ClientStatusModal';
import ClientHistoryModal from './ClientHistoryModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ClientManagerProps {
  onNavigate?: (tab: string) => void;
}

const ClientManager = ({ onNavigate }: ClientManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          appointments!inner(id, status)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calcular visitas baseado nos agendamentos
      const clientsWithVisits = (data || []).map(client => {
        const completedAppointments = client.appointments?.filter(apt => apt.status === 'completed') || [];
        return {
          ...client,
          total_visits: completedAppointments.length,
          total_appointments: client.appointments?.length || 0
        };
      });

      setClients(clientsWithVisits);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

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

  const handleClientAction = (action: string, client: any) => {
    console.log('Client action:', action, client);
    switch (action) {
      case 'message':
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "Integração com WhatsApp será implementada em breve",
        });
        break;
      case 'schedule':
        onNavigate?.('calendar');
        break;
      case 'status':
        setSelectedClient(client);
        setIsStatusModalOpen(true);
        break;
      case 'history':
        setSelectedClient(client);
        setIsHistoryModalOpen(true);
        break;
    }
  };

  const handleUpdateClientStatus = async (clientId: string, newTags: string[]) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ tags: newTags })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "Status do cliente foi atualizado com sucesso",
      });

      loadClients();
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const totalClients = clients.length;
  const vipClients = clients.filter(c => c.tags?.includes('VIP')).length;
  const newClients = clients.filter(c => c.tags?.includes('Novo')).length;
  const averageVisits = clients.length > 0 
    ? Math.round(clients.reduce((acc, c) => acc + (c.total_visits || 0), 0) / clients.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Clientes</h1>
          <p className="text-gray-600">Gerencie todos os seus clientes em um só lugar</p>
          <p className="text-sm text-blue-600 mt-1">
            ℹ️ Clientes são criados automaticamente no primeiro agendamento
          </p>
        </div>
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
                <p className="text-2xl font-bold text-gray-800">{totalClients}</p>
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
                <p className="text-2xl font-bold text-gray-800">{vipClients}</p>
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
                <p className="text-2xl font-bold text-gray-800">{newClients}</p>
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
                <p className="text-2xl font-bold text-gray-800">{averageVisits}</p>
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
            {filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Tente buscar com outros termos'
                    : 'Os clientes são criados automaticamente no primeiro agendamento'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => onNavigate?.('calendar')}
                    className="bg-gradient-to-r from-blue-500 to-green-500"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Criar Primeiro Agendamento
                  </Button>
                )}
              </div>
            ) : (
              filteredClients.map((client) => (
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
                        {client.email && (
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {client.tags?.map((tag) => (
                          <Badge key={tag} className={getTagColor(tag)}>
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {client.total_visits || 0} visitas
                        </Badge>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          {client.total_appointments || 0} total
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleClientAction('history', client)}
                      title="Ver histórico completo"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleClientAction('message', client)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleClientAction('schedule', client)}
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleClientAction('status', client)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ClientStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        client={selectedClient}
        onUpdateStatus={handleUpdateClientStatus}
      />

      <ClientHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        client={selectedClient}
      />
    </div>
  );
};

export default ClientManager;
