
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
    { id: 'calendar', label: 'Agenda', icon: Calendar, color: 'text-primary' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-primary' },
    { id: 'clients', label: 'Clientes', icon: Users, color: 'text-primary' },
    { id: 'checkin', label: 'Check-in', icon: CheckCircle, color: 'text-primary' },
    { id: 'services', label: 'Serviços', icon: Scissors, color: 'text-primary' },
    { id: 'professionals', label: 'Profissionais', icon: UserCheck, color: 'text-primary' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, color: 'text-primary' },
    { id: 'admin', label: 'Configurações', icon: Settings, color: 'text-primary' }
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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-foreground" />
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
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <Badge variant="secondary" className="ml-auto bg-primary-foreground/20 text-primary-foreground">
                      Ativo
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-1">AgendaGo Pro</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Sistema completo para sua empresa
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs border-primary/20">Supabase</Badge>
                <Badge variant="outline" className="text-xs border-primary/20">Real-time</Badge>
                <Badge variant="outline" className="text-xs border-primary/20">Mobile</Badge>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
