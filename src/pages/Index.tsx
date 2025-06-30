
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MessageSquare, BarChart3, CreditCard, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import ClientManager from '@/components/ClientManager';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Dinâmica',
      description: 'Gestão completa de horários, múltiplos profissionais e visualização flexível'
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastro completo com histórico, tags e campos personalizáveis'
    },
    {
      icon: MessageSquare,
      title: 'Confirmações Automáticas',
      description: 'WhatsApp, SMS e e-mail com mensagens personalizadas'
    },
    {
      icon: CreditCard,
      title: 'Pagamentos Integrados',
      description: 'Pix, cartão e boleto com pré-pagamento opcional'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Avançados',
      description: 'Dashboard com métricas, gráficos e exportação em PDF/Excel'
    },
    {
      icon: CheckCircle,
      title: 'Check-in Online',
      description: 'Confirmação de presença e reagendamento inteligente'
    }
  ];

  if (currentTab !== 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header onTabChange={setCurrentTab} currentTab={currentTab} />
        <main className="container mx-auto px-4 py-8">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsContent value="dashboard">
              <Dashboard onNavigate={setCurrentTab} />
            </TabsContent>
            <TabsContent value="clients">
              <ClientManager onNavigate={setCurrentTab} />
            </TabsContent>
            <TabsContent value="calendar">
              <AppointmentCalendar />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onTabChange={setCurrentTab} currentTab={currentTab} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30">
              🚀 Bem-vindo, {user?.email?.split('@')[0]}!
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              AgendaGo
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Transforme sua gestão de agendamentos com a plataforma que une simplicidade, 
              personalização e recursos avançados
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl shadow-lg"
                onClick={() => setCurrentTab('dashboard')}
              >
                Acessar Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl"
                onClick={() => setCurrentTab('calendar')}
              >
                Ver Agenda
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desenvolvido para suprir todas as necessidades de clínicas, salões, consultórios e prestadores de serviços
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Por que escolher o AgendaGo?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">98%</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Taxa de Satisfação</h3>
              <p className="text-gray-600">Clientes satisfeitos com a facilidade de uso</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">24/7</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Suporte Completo</h3>
              <p className="text-gray-600">Atendimento sempre disponível para ajudar</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">+50</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Recursos Únicos</h3>
              <p className="text-gray-600">Funcionalidades que outros sistemas não têm</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para revolucionar seus agendamentos?
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Você já está conectado! Comece a explorar todas as funcionalidades do AgendaGo
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 font-semibold px-8 py-3 rounded-xl shadow-lg"
            onClick={() => setCurrentTab('dashboard')}
          >
            Explorar Funcionalidades
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
