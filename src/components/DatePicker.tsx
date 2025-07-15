import * as React from 'react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Pick a date',
  minDate,
  maxDate,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
          disabled={disabled}
        >
          {value ? format(value, 'PPP') : <span className="text-muted-foreground">{placeholder}</span>}
          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={onChange}
          fromDate={minDate}
          toDate={maxDate}
          initialFocus
        />
        <div className="flex items-center justify-between p-2 border-t bg-muted">
          <Button
            size="sm"
            onClick={() => onChange(null)}
            className="bg-red-500 text-white hover:bg-red-600 shadow-none"
            disabled={!value}
          >
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
          <Button
            size="sm"
            onClick={() => onChange(new Date())}
            className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 active:bg-white active:text-blue-600 shadow-none"
          >
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 