import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Edit, Clock, Trash2, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PhoneInput from './PhoneInput';
import ProfessionalAvailabilityManager from './ProfessionalAvailabilityManager';

const ProfessionalManager = () => {
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [availabilityProfessional, setAvailabilityProfessional] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [],
    services: [],
    status: 'active'
  });

  useEffect(() => {
    if (user) {
      loadProfessionals();
      loadServices();
    }
  }, [user]);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          professional_services (
            services (*)
          )
        `)
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const formattedProfessionals = data?.map(prof => ({
        ...prof,
        services: prof.professional_services?.map(ps => ps.services) || []
      })) || [];

      setProfessionals(formattedProfessionals);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast({
        title: "Erro ao carregar profissionais",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      services: [],
      status: 'active'
    });
    setEditingProfessional(null);
  };

  const handleEdit = (professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name || '',
      email: professional.email || '',
      phone: professional.phone || '',
      specialties: professional.specialties || [],
      services: professional.services?.map(s => s.id) || [],
      status: professional.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do profissional",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const professionalData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        specialties: formData.specialties.length > 0 ? formData.specialties : null,
        status: formData.status,
        user_id: user.id
      };

      let professionalId;

      if (editingProfessional) {
        // Atualizar profissional existente
        const { error: updateError } = await supabase
          .from('professionals')
          .update(professionalData)
          .eq('id', editingProfessional.id);

        if (updateError) throw updateError;
        professionalId = editingProfessional.id;

        toast({
          title: "Profissional atualizado!",
          description: `${formData.name} foi atualizado com sucesso`,
        });
      } else {
        // Criar novo profissional
        const { data: newProfessional, error: insertError } = await supabase
          .from('professionals')
          .insert([professionalData])
          .select()
          .single();

        if (insertError) throw insertError;
        professionalId = newProfessional.id;

        toast({
          title: "Profissional criado!",
          description: `${formData.name} foi adicionado com sucesso`,
        });
      }

      // Atualizar serviços do profissional
      // Primeiro remover todos os serviços existentes
      await supabase
        .from('professional_services')
        .delete()
        .eq('professional_id', professionalId);

      // Adicionar novos serviços
      if (formData.services.length > 0) {
        const serviceInserts = formData.services.map(serviceId => ({
          professional_id: professionalId,
          service_id: serviceId
        }));

        const { error: servicesError } = await supabase
          .from('professional_services')
          .insert(serviceInserts);

        if (servicesError) throw servicesError;
      }

      resetForm();
      setIsModalOpen(false);
      loadProfessionals();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      toast({
        title: "Erro ao salvar profissional",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (professional) => {
    if (!confirm(`Tem certeza que deseja excluir ${professional.name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', professional.id);

      if (error) throw error;

      toast({
        title: "Profissional excluído!",
        description: `${professional.name} foi removido com sucesso`,
      });

      loadProfessionals();
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast({
        title: "Erro ao excluir profissional",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleManageAvailability = (professional) => {
    setAvailabilityProfessional(professional);
  };

  const handleCloseAvailability = () => {
    setAvailabilityProfessional(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Profissionais</h1>
          <p className="text-gray-600">Gerencie a equipe e disponibilidade</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 w-full sm:w-auto"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
              <DialogDescription>
                {editingProfessional ? 'Edite os dados do profissional' : 'Cadastre um novo membro da equipe'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Nome*</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome completo do profissional"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <PhoneInput
                      id="phone"
                      value={formData.phone}
                      onChange={(value) => setFormData({...formData, phone: value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Serviços que realiza</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.services.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({...formData, services: [...formData.services, service.id]});
                            } else {
                              setFormData({...formData, services: formData.services.filter(s => s !== service.id)});
                            }
                          }}
                        />
                        <Label htmlFor={`service-${service.id}`} className="text-sm">
                          {service.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-green-500"
              >
                {loading ? "Salvando..." : (editingProfessional ? "Atualizar" : "Criar")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gerenciador de Disponibilidade */}
      {availabilityProfessional && (
        <ProfessionalAvailabilityManager
          professionalId={availabilityProfessional.id}
          professionalName={availabilityProfessional.name}
          onClose={handleCloseAvailability}
        />
      )}

      {/* Lista de Profissionais */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">Carregando profissionais...</p>
            </CardContent>
          </Card>
        ) : professionals.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum profissional cadastrado</p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-green-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Profissional
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          professionals.map((professional) => (
            <Card key={professional.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{professional.name}</CardTitle>
                      <CardDescription>
                        {professional.email && (
                          <span className="mr-4">{professional.email}</span>
                        )}
                        {professional.phone && (
                          <span>{professional.phone}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={professional.status === 'active' ? 'default' : 'secondary'}>
                      {professional.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Serviços:</h4>
                    <div className="flex flex-wrap gap-2">
                      {professional.services?.length > 0 ? (
                        professional.services.map((service) => (
                          <Badge key={service.id} variant="outline">
                            {service.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum serviço configurado</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(professional)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManageAvailability(professional)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Horários
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(professional)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfessionalManager;
