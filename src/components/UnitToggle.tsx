
import { motion } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface UnitToggleProps {
  unit: 'celsius' | 'fahrenheit';
  onUnitChange: (unit: 'celsius' | 'fahrenheit') => void;
}

export function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={unit} 
      className="bg-white/20 backdrop-blur-md dark:bg-slate-800/30 rounded-full p-1 border border-white/30 dark:border-slate-700/30 shadow-lg"
      onValueChange={(value) => {
        if (value) onUnitChange(value as 'celsius' | 'fahrenheit');
      }}
    >
      <ToggleGroupItem 
        value="celsius" 
        aria-label="Toggle celsius" 
        className="data-[state=on]:bg-primary data-[state=on]:text-white dark:data-[state=on]:text-black font-medium rounded-full px-4"
      >
        <motion.span
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          °C
        </motion.span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="fahrenheit" 
        aria-label="Toggle fahrenheit" 
        className="data-[state=on]:bg-primary data-[state=on]:text-white dark:data-[state=on]:text-black font-medium rounded-full px-4"
      >
        <motion.span
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          °F
        </motion.span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
