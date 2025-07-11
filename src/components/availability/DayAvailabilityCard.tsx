import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface DayAvailabilityCardProps {
  day: {
    day_of_week: number;
    is_available: boolean;
    start_time: string;
    end_time: string;
    professional_id: string;
  };
  dayInfo: {
    id: number;
    name: string;
    short: string;
  };
  onUpdate: (dayOfWeek: number, field: string, value: any) => void;
}

const DayAvailabilityCard = ({ day, dayInfo, onUpdate }: DayAvailabilityCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-16">
          <Badge variant="outline" className="text-xs">
            {dayInfo.short}
          </Badge>
        </div>
        <div className="w-32">
          <p className="font-medium text-sm">{dayInfo.name}</p>
        </div>
        <Switch
          checked={day.is_available}
          onCheckedChange={(checked) => 
            onUpdate(day.day_of_week, 'is_available', checked)
          }
        />
      </div>
      
      {day.is_available && (
        <div className="flex items-center space-x-2">
          <div>
            <Label htmlFor={`start-${day.day_of_week}`} className="text-xs">
              Início
            </Label>
            <Input
              id={`start-${day.day_of_week}`}
              type="time"
              value={day.start_time}
              onChange={(e) => 
                onUpdate(day.day_of_week, 'start_time', e.target.value)
              }
              className="w-24"
            />
          </div>
          <div>
            <Label htmlFor={`end-${day.day_of_week}`} className="text-xs">
              Fim
            </Label>
            <Input
              id={`end-${day.day_of_week}`}
              type="time"
              value={day.end_time}
              onChange={(e) => 
                onUpdate(day.day_of_week, 'end_time', e.target.value)
              }
              className="w-24"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DayAvailabilityCard;