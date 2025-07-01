
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Clock, Settings, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ProfessionalManager = () => {
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [],
    services: [],
    availability: {
      monday: { active: true, start: '08:00', end: '18:00' },
      tuesday: { active: true, start: '08:00', end: '18:00' },
      wednesday: { active: true, start: '08:00', end: '18:00' },
      thursday: { active: true, start: '08:00', end: '18:00' },
      friday: { active: true, start: '08:00', end: '18:00' },
      saturday: { active: false, start: '08:00', end: '12:00' },
      sunday: { active: false, start: '08:00', end: '12:00' }
    }
  });

  useEffect(() => {
    if (user) {
      loadProfessionals();
      loadServices();
    }
  }, [user]);

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          professional_services (
            services (*)
          ),
          professional_availability (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar profissionais",
        description: "Tente novamente",
        variant: "destructive",
      });
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
      toast({
        title: "Erro ao carregar serviços",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfessional = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const professionalData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialties: formData.specialties,
        user_id: user.id
      };

      let professionalId;

      if (selectedProfessional) {
        const { error } = await supabase
          .from('professionals')
          .update(professionalData)
          .eq('id', selectedProfessional.id);
        
        if (error) throw error;
        professionalId = selectedProfessional.id;
      } else {
        const { data, error } = await supabase
          .from('professionals')
          .insert([professionalData])
          .select()
          .single();
        
        if (error) throw error;
        professionalId = data.id;
      }

      // Salvar disponibilidade
      await supabase
        .from('professional_availability')
        .delete()
        .eq('professional_id', professionalId);

      const availabilityData = [];
      Object.entries(formData.availability).forEach(([day, config], index) => {
        if (config.active) {
          availabilityData.push({
            professional_id: professionalId,
            day_of_week: index === 6 ? 0 : index + 1, // Domingo = 0
            start_time: config.start,
            end_time: config.end,
            is_available: true
          });
        }
      });

      if (availabilityData.length > 0) {
        const { error } = await supabase
          .from('professional_availability')
          .insert(availabilityData);
        
        if (error) throw error;
      }

      // Salvar serviços
      await supabase
        .from('professional_services')
        .delete()
        .eq('professional_id', professionalId);

      if (formData.services.length > 0) {
        const serviceData = formData.services.map(serviceId => ({
          professional_id: professionalId,
          service_id: serviceId
        }));

        const { error } = await supabase
          .from('professional_services')
          .insert(serviceData);
        
        if (error) throw error;
      }

      toast({
        title: "Profissional salvo!",
        description: "Dados atualizados com sucesso",
      });

      setIsDialogOpen(false);
      resetForm();
      loadProfessionals();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      services: [],
      availability: {
        monday: { active: true, start: '08:00', end: '18:00' },
        tuesday: { active: true, start: '08:00', end: '18:00' },
        wednesday: { active: true, start: '08:00', end: '18:00' },
        thursday: { active: true, start: '08:00', end: '18:00' },
        friday: { active: true, start: '08:00', end: '18:00' },
        saturday: { active: false, start: '08:00', end: '12:00' },
        sunday: { active: false, start: '08:00', end: '12:00' }
      }
    });
    setSelectedProfessional(null);
  };

  const handleEditProfessional = (professional) => {
    setSelectedProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email || '',
      phone: professional.phone || '',
      specialties: professional.specialties || [],
      services: professional.professional_services?.map(ps => ps.services.id) || [],
      availability: formData.availability // Keep default for now
    });
    setIsDialogOpen(true);
  };

  const dayNames = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Profissionais</h1>
          <p className="text-gray-600">Gerencie profissionais e suas disponibilidades</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-green-500"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
              <DialogDescription>
                Configure os dados e disponibilidade do profissional
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Dados básicos */}
              <div className="space-y-4">
                <h3 className="font-semibold">Dados Pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Serviços */}
              <div className="space-y-4">
                <h3 className="font-semibold">Serviços Oferecidos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={formData.services.includes(service.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              services: [...formData.services, service.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              services: formData.services.filter(id => id !== service.id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`service-${service.id}`}>{service.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disponibilidade */}
              <div className="space-y-4">
                <h3 className="font-semibold">Horários de Atendimento</h3>
                <div className="space-y-3">
                  {Object.entries(dayNames).map(([day, label]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-20">
                        <Checkbox
                          id={`day-${day}`}
                          checked={formData.availability[day].active}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              availability: {
                                ...formData.availability,
                                [day]: {
                                  ...formData.availability[day],
                                  active: checked
                                }
                              }
                            });
                          }}
                        />
                        <Label htmlFor={`day-${day}`} className="ml-2">{label}</Label>
                      </div>
                      
                      {formData.availability[day].active && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={formData.availability[day].start}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                availability: {
                                  ...formData.availability,
                                  [day]: {
                                    ...formData.availability[day],
                                    start: e.target.value
                                  }
                                }
                              });
                            }}
                            className="w-24"
                          />
                          <span>às</span>
                          <Input
                            type="time"
                            value={formData.availability[day].end}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                availability: {
                                  ...formData.availability,
                                  [day]: {
                                    ...formData.availability[day],
                                    end: e.target.value
                                  }
                                }
                              });
                            }}
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveProfessional} 
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-green-500"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de profissionais */}
      <div className="grid gap-4">
        {professionals.map((professional) => (
          <Card key={professional.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{professional.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {professional.email && (
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {professional.email}
                        </span>
                      )}
                      {professional.phone && (
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {professional.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {professional.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {professional.professional_services?.length > 0 && (
                        <Badge variant="outline">
                          {professional.professional_services.length} serviços
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProfessional(professional)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {professionals.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Nenhum profissional cadastrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Cadastre profissionais para começar a receber agendamentos
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-green-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Profissional
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfessionalManager;
