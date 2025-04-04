
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface UnitToggleProps {
  unit: 'celsius' | 'fahrenheit';
  onUnitChange: (unit: 'celsius' | 'fahrenheit') => void;
}

export function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <ToggleGroup type="single" value={unit} onValueChange={(value) => {
      if (value) onUnitChange(value as 'celsius' | 'fahrenheit');
    }}>
      <ToggleGroupItem value="celsius" aria-label="Toggle celsius">
        °C
      </ToggleGroupItem>
      <ToggleGroupItem value="fahrenheit" aria-label="Toggle fahrenheit">
        °F
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
