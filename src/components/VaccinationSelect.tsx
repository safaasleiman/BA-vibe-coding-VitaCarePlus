import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  GERMAN_VACCINATIONS, 
  VACCINATION_CATEGORIES,
  type GermanVaccination 
} from "@/lib/germanVaccinations";

interface VaccinationSelectProps {
  value: string;
  onValueChange: (value: string, vaccination?: GermanVaccination) => void;
  disabled?: boolean;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
}

export const VaccinationSelect = ({
  value,
  onValueChange,
  disabled = false,
  customValue = "",
  onCustomValueChange,
}: VaccinationSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedVaccination = useMemo(() => {
    return GERMAN_VACCINATIONS.find((v) => v.id === value);
  }, [value]);

  const filteredVaccinations = useMemo(() => {
    if (!searchQuery) return GERMAN_VACCINATIONS;
    const query = searchQuery.toLowerCase();
    return GERMAN_VACCINATIONS.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedVaccinations = useMemo(() => {
    return VACCINATION_CATEGORIES.map((category) => ({
      ...category,
      vaccinations: filteredVaccinations.filter((v) => v.category === category.id),
    })).filter((group) => group.vaccinations.length > 0);
  }, [filteredVaccinations]);

  const isCustomEntry = value === "sonstige";

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            {selectedVaccination ? (
              <span className="flex items-center gap-2 truncate">
                <Syringe className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{selectedVaccination.name}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Impfung auswählen...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 z-[100]" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                placeholder="Impfung suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>Keine Impfung gefunden.</CommandEmpty>
              {groupedVaccinations.map((group) => (
                <CommandGroup key={group.id} heading={group.label}>
                  {group.vaccinations.map((vaccination) => (
                    <CommandItem
                      key={vaccination.id}
                      value={vaccination.id}
                      onSelect={() => {
                        onValueChange(vaccination.id, vaccination);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === vaccination.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="font-medium">{vaccination.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-6">
                        {vaccination.description}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isCustomEntry && (
        <div className="space-y-2 pt-2">
          <Label htmlFor="custom_vaccine">Name der Impfung *</Label>
          <Input
            id="custom_vaccine"
            placeholder="Name der Impfung eingeben..."
            value={customValue}
            onChange={(e) => onCustomValueChange?.(e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      )}
    </div>
  );
};
