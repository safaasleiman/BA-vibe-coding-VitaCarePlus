import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addMonths } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { generateCheckUpSchedule } from "@/lib/checkUpCalculator";

interface AddCheckUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  dateOfBirth: string;
  gender: string;
  onCheckUpAdded: () => void;
}

export const AddCheckUpDialog = ({
  open,
  onOpenChange,
  userId,
  dateOfBirth,
  gender,
  onCheckUpAdded,
}: AddCheckUpDialogProps) => {
  const [selectedType, setSelectedType] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [actualDate, setActualDate] = useState<Date>();
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [intervalMonths, setIntervalMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const applicableCheckUps = generateCheckUpSchedule(
    new Date(dateOfBirth),
    gender as 'male' | 'female' | 'diverse'
  );

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const checkUp = applicableCheckUps.find(c => c.type === type);
    if (checkUp) {
      setIntervalMonths(checkUp.intervalMonths);
      // Set due date based on interval from today
      setDueDate(new Date());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !dueDate) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('check_ups')
        .insert({
          user_id: userId,
          check_up_type: selectedType,
          due_date: format(dueDate, 'yyyy-MM-dd'),
          actual_date: actualDate ? format(actualDate, 'yyyy-MM-dd') : null,
          doctor_name: doctorName || null,
          notes: notes || null,
          interval_months: intervalMonths,
        });

      if (error) throw error;

      toast({
        title: "Check-up hinzugefügt",
        description: `${selectedType} wurde erfolgreich gespeichert.`,
      });

      // Reset form
      setSelectedType("");
      setDueDate(undefined);
      setActualDate(undefined);
      setDoctorName("");
      setNotes("");
      setIntervalMonths(12);

      onCheckUpAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Check-up hinzufügen</DialogTitle>
          <DialogDescription>
            Fügen Sie eine neue Vorsorgeuntersuchung hinzu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Art der Untersuchung *</Label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Untersuchung auswählen" />
              </SelectTrigger>
              <SelectContent>
                {applicableCheckUps.map((checkUp) => (
                  <SelectItem key={checkUp.type} value={checkUp.type}>
                    <div>
                      <div className="font-medium">{checkUp.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {checkUp.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="Andere">Andere</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedType === "Andere" && (
            <div className="space-y-2">
              <Label>Eigene Bezeichnung</Label>
              <Input
                value={selectedType === "Andere" ? "" : selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                placeholder="z.B. Augenuntersuchung"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Fälligkeitsdatum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="bottom" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Durchführungsdatum (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !actualDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actualDate ? format(actualDate, "dd.MM.yyyy", { locale: de }) : "Falls bereits durchgeführt"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="bottom" align="start">
                <Calendar
                  mode="single"
                  selected={actualDate}
                  onSelect={setActualDate}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Intervall (Monate)</Label>
            <Input
              type="number"
              value={intervalMonths}
              onChange={(e) => setIntervalMonths(parseInt(e.target.value) || 12)}
              min={1}
              max={120}
            />
          </div>

          <div className="space-y-2">
            <Label>Arzt/Praxis (optional)</Label>
            <Input
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. Mustermann"
            />
          </div>

          <div className="space-y-2">
            <Label>Notizen (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedType || !dueDate}
              className="flex-1"
            >
              {loading ? "Speichert..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
