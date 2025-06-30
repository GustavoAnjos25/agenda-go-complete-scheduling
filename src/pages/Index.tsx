
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
import Reports from '@/components/Reports';
import CheckIn from '@/components/CheckIn';
import ServicesAdmin from '@/components/ServicesAdmin';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { user } = useAuth();

  // Usuário autenticado sempre vai direto para o dashboard
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
          <TabsContent value="reports">
            <Reports />
          </TabsContent>
          <TabsContent value="checkin">
            <CheckIn />
          </TabsContent>
          <TabsContent value="services">
            <ServicesAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
