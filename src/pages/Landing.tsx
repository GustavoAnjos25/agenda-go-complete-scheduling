import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, BarChart3, CheckCircle, Scissors, Star, ArrowRight, Smartphone, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Agendamentos Inteligentes',
      description: 'Sistema completo para gerenciar horários, evitar conflitos e otimizar sua agenda automaticamente',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Controle Total de Clientes',
      description: 'Cadastre, organize e acompanhe o histórico completo de todos os seus clientes em um só lugar',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Relatórios e Análises',
      description: 'Acompanhe seu faturamento, performance e crescimento com dashboards visuais e relatórios detalhados',
      color: 'from-slate-500 to-slate-600'
    },
    {
      icon: CheckCircle,
      title: 'Check-in Automatizado',
      description: 'Sistema de check-in que agiliza o atendimento e melhora a experiência dos seus clientes',
      color: 'from-emerald-600 to-green-600'
    },
    {
      icon: Smartphone,
      title: '100% Responsivo',
      description: 'Acesse de qualquer dispositivo - computador, tablet ou celular. Sua agenda sempre na palma da mão',
      color: 'from-teal-600 to-blue-500'
    },
    {
      icon: Star,
      title: 'Gestão de Equipe',
      description: 'Gerencie vários profissionais, horários individuais e disponibilidade de cada membro da equipe',
      color: 'from-slate-600 to-emerald-500'
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Economia de Tempo',
      description: 'Automatize tarefas repetitivas e ganhe mais tempo para focar no que realmente importa: seus clientes'
    },
    {
      icon: Shield,
      title: 'Organização Automática',
      description: 'Nunca mais perca um agendamento ou se esqueça de um cliente. Tudo organizado automaticamente'
    },
    {
      icon: Smartphone,
      title: 'Acesso Mobile',
      description: 'Gerencie sua agenda de qualquer lugar, a qualquer hora, direto do seu celular'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Cadastre seus Serviços',
      description: 'Configure os serviços que você oferece com preços e durações personalizadas'
    },
    {
      step: '2',
      title: 'Adicione seus Clientes',
      description: 'Cadastre seus clientes com informações de contato e histórico de atendimentos'
    },
    {
      step: '3',
      title: 'Configure sua Equipe',
      description: 'Adicione profissionais e defina a disponibilidade de cada um'
    },
    {
      step: '4',
      title: 'Comece a Agendar',
      description: 'Crie agendamentos inteligentes que respeitam disponibilidade e evitam conflitos'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AgendaGo</h1>
                <p className="text-xs text-slate-600">Sistema Profissional de Agendamentos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Entrar
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
              >
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-6">
              ✨ Sistema Completo de Agendamentos
            </Badge>
            <h2 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
              Transforme seu Negócio com<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Agendamentos Inteligentes
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              O AgendaGo é a solução completa para profissionais que desejam organizar agendamentos, 
              gerenciar clientes e aumentar a produtividade com tecnologia de ponta.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-8 py-4 text-lg shadow-xl"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Criar Minha Conta Grátis
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-800 mb-4">
                Tudo que você precisa em um só lugar
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Funcionalidades profissionais desenvolvidas especialmente para otimizar seu tempo e aumentar seus resultados
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-800 mb-4">
                Por que escolher o AgendaGo?
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Desenvolvido por profissionais, para profissionais que buscam excelência
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-4">{benefit.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 px-4 bg-white/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-800 mb-4">
                Como funciona?
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Configure seu sistema em poucos minutos e comece a usar imediatamente
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">{step.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="relative p-12 text-center">
                <h3 className="text-4xl font-bold mb-6">Pronto para revolucionar seus agendamentos?</h3>
                <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Junte-se a milhares de profissionais que já transformaram seus negócios com o AgendaGo. 
                  Comece gratuitamente e veja a diferença em poucos minutos.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="flex items-center justify-center space-x-8 mb-6 sm:mb-0">
                    <div className="text-center">
                      <div className="text-3xl font-bold">∞</div>
                      <div className="text-sm text-emerald-100">Agendamentos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">∞</div>
                      <div className="text-sm text-emerald-100">Clientes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">24/7</div>
                      <div className="text-sm text-emerald-100">Disponível</div>
                    </div>
                  </div>
                </div>
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 px-12 py-4 text-lg font-semibold shadow-xl"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Começar Agora - É Grátis!
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xl font-bold">AgendaGo</h4>
          </div>
          <p className="text-gray-400 mb-6">
            Sistema profissional de agendamentos - Simples, eficiente e poderoso
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 AgendaGo. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;