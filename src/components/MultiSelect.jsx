import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MultiSelect({ label, options, onChange }) {
  const [selectedValues, setSelectedValues] = React.useState([]);

  const handleValueChange = (value) => {
    let newValues;
    if (selectedValues.includes(value)) {
      newValues = selectedValues.filter(v => v !== value);
    } else {
      newValues = [...selectedValues, value];
    }
    setSelectedValues(newValues);
    onChange(newValues);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue className="hover:bg-green-200 z-5" placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}