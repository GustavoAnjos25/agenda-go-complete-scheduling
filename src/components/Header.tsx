
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Users, BarChart3, CheckCircle, Scissors, UserCheck, Settings, LogOut, User, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/utils/authCleanup';
import MobileNavigation from './MobileNavigation';

interface HeaderProps {
  onTabChange: (tab: string) => void;
  currentTab: string;
}

const Header = ({ onTabChange, currentTab }: HeaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const navigationItems = [
    { id: 'calendar', label: 'Agenda', icon: Calendar, color: 'text-primary' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-primary' },
    { id: 'clients', label: 'Clientes', icon: Users, color: 'text-primary' },
    { id: 'checkin', label: 'Check-in', icon: CheckCircle, color: 'text-primary' },
    { id: 'services', label: 'Serviços', icon: Scissors, color: 'text-primary' },
    { id: 'professionals', label: 'Profissionais', icon: UserCheck, color: 'text-primary' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, color: 'text-primary' },
    { id: 'admin', label: 'Admin', icon: Settings, color: 'text-primary' }
  ];

  const handleSignOut = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue mesmo se falhar
      }
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Logo e título */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => onTabChange('calendar')}>
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => onTabChange('calendar')}>AgendaGo</h1>
              <p className="text-xs text-muted-foreground">Sistema de Agendamentos</p>
            </div>
          </div>

          {/* Navegação Mobile */}
          <MobileNavigation currentTab={currentTab} onTabChange={onTabChange} />

          {/* Navegação Desktop */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary-foreground' : item.color}`} />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Menu do usuário */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Badge variant="outline" className="hidden sm:inline-flex bg-primary/10 text-primary border-primary/20">
            ✓ Online
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm text-gray-700">
                    {user?.email || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Conta ativa
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onTabChange('admin')}>
                <User className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
