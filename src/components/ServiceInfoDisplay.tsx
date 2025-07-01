
import { Card, CardContent } from '@/components/ui/card';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceInfoDisplayProps {
  serviceName: string;
  duration: number;
  price: number;
}

const ServiceInfoDisplay = ({ serviceName, duration, price }: ServiceInfoDisplayProps) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800 mb-3">{serviceName}</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Duração: <strong>{duration} minutos</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                Preço: <strong>R$ {price.toFixed(2)}</strong>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceInfoDisplay;
