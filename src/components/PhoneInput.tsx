
import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const formatPhone = (value: string) => {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      
      // Limita a 11 dígitos
      const limited = numbers.slice(0, 11);
      
      // Aplica a máscara
      if (limited.length <= 2) {
        return limited;
      } else if (limited.length <= 7) {
        return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
      } else {
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      onChange(formatted);
    };

    const isValid = (phone: string) => {
      const numbers = phone.replace(/\D/g, '');
      return numbers.length === 10 || numbers.length === 11;
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        className={`${props.className} ${value && !isValid(value) ? 'border-red-300' : ''}`}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
