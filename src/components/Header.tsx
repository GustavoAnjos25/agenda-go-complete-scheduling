
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onTabChange: (tab: string) => void;
  currentTab: string;
}

const Header = ({ onTabChange, currentTab }: HeaderProps) => {
  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'calendar', label: 'Agenda' },
    { id: 'clients', label: 'Clientes' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AgendaGo</h1>
              <Badge variant="secondary" className="text-xs">BETA</Badge>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`font-medium transition-colors ${
                  currentTab === item.id
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="hidden md:inline-flex">
              Entrar
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
              Começar Grátis
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
