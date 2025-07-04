import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, BarChart3, CheckCircle, Scissors, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

const Home = ({ onNavigate }: HomeProps) => {
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Inteligente',
      description: 'Gerencie todos os seus agendamentos de forma simples e eficiente',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastre e organize informações completas dos seus clientes',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Scissors,
      title: 'Catálogo de Serviços',
      description: 'Configure seus serviços com preços e durações personalizadas',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: CheckCircle,
      title: 'Check-in Rápido',
      description: 'Sistema de check-in para agilizar o atendimento',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Detalhados',
      description: 'Acompanhe o desempenho do seu negócio com gráficos',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Star,
      title: 'Profissionais',
      description: 'Gerencie equipe e disponibilidade de cada profissional',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const quickActions = [
    { id: 'clients', label: 'Cadastrar Cliente', icon: Users, description: 'Adicione um novo cliente ao sistema' },
    { id: 'services', label: 'Configurar Serviços', icon: Scissors, description: 'Defina seus serviços e preços' },
    { id: 'professionals', label: 'Adicionar Profissional', icon: Star, description: 'Cadastre profissionais da sua equipe' },
    { id: 'calendar', label: 'Nova Agenda', icon: Calendar, description: 'Crie um novo agendamento' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AgendaGo</h1>
              <p className="text-xs text-gray-500">Sistema de Agendamentos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✓ Online
            </Badge>
            <Button 
              onClick={() => onNavigate('dashboard')}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              Ir para Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Bem-vindo ao AgendaGo
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A solução completa para gerenciar agendamentos, clientes e seu negócio de forma profissional e eficiente.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg"
              onClick={() => onNavigate('dashboard')}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 px-8"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Ver Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('calendar')}
              className="px-8"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Criar Agendamento
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Recursos Disponíveis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Ações Rápidas para Começar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{action.label}</h4>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                    <Button 
                      onClick={() => onNavigate(action.id)}
                      variant="outline" 
                      size="sm"
                      className="w-full group-hover:bg-blue-50 group-hover:border-blue-200"
                    >
                      Acessar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats Preview */}
        <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Configure seu sistema em poucos minutos e comece a gerenciar seus agendamentos de forma profissional.
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm text-blue-100">Agendamentos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm text-blue-100">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm text-blue-100">Serviços</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;