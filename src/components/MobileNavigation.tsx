
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  CheckCircle, 
  Scissors, 
  UserCheck,
  Settings,
  Menu,
  Home
} from 'lucide-react';

interface MobileNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ currentTab, onTabChange }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Início', icon: Home, color: 'text-gray-600' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-600' },
    { id: 'calendar', label: 'Agenda', icon: Calendar, color: 'text-green-600' },
    { id: 'clients', label: 'Clientes', icon: Users, color: 'text-purple-600' },
    { id: 'checkin', label: 'Check-in', icon: CheckCircle, color: 'text-orange-600' },
    { id: 'services', label: 'Serviços', icon: Scissors, color: 'text-teal-600' },
    { id: 'professionals', label: 'Profissionais', icon: UserCheck, color: 'text-indigo-600' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, color: 'text-red-600' },
    { id: 'admin', label: 'Configurações', icon: Settings, color: 'text-gray-600' }
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  const getCurrentTabLabel = () => {
    const currentItem = navigationItems.find(item => item.id === currentTab);
    return currentItem?.label || 'AgendaGo';
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="mr-2">
            <Menu className="w-4 h-4 mr-2" />
            {getCurrentTabLabel()}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              AgendaGo
            </SheetTitle>
            <SheetDescription>
              Sistema completo de agendamentos
            </SheetDescription>
          </SheetHeader>
          
          <nav className="mt-8 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                      Ativo
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-1">AgendaGo Pro</h4>
              <p className="text-sm text-gray-600 mb-3">
                Sistema completo para sua empresa
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">Supabase</Badge>
                <Badge variant="outline" className="text-xs">Real-time</Badge>
                <Badge variant="outline" className="text-xs">Mobile</Badge>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
