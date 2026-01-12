import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Lock, User, Baby } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getEncryptionKey, encryptText } from "@/lib/encryption";
import { VaccinationSelect } from "@/components/VaccinationSelect";
import type { GermanVaccination } from "@/lib/germanVaccinations";

interface Child {
  id: string;
  first_name: string;
  last_name: string;
}

interface AddVaccinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  children?: Child[];
  onVaccinationAdded?: () => void;
}

export const AddVaccinationDialog = ({ open, onOpenChange, userId, children = [], onVaccinationAdded }: AddVaccinationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("self");
  const { toast } = useToast();
  const [vaccinationDate, setVaccinationDate] = useState<Date>();
  const [vaccinationDateInput, setVaccinationDateInput] = useState("");
  const [nextDueDate, setNextDueDate] = useState<Date>();
  const [nextDueDateInput, setNextDueDateInput] = useState("");
  const [selectedVaccinationId, setSelectedVaccinationId] = useState<string>("");
  const [customVaccineName, setCustomVaccineName] = useState("");
  const [formData, setFormData] = useState({
    vaccine_type: "",
    doctor_name: "",
    batch_number: "",
    notes: "",
  });

  // Load encryption key
  useEffect(() => {
    if (userId) {
      getEncryptionKey(userId).then(setEncryptionKey);
    }
  }, [userId]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedChildId("self");
      setSelectedVaccinationId("");
      setCustomVaccineName("");
      setFormData({
        vaccine_type: "",
        doctor_name: "",
        batch_number: "",
        notes: "",
      });
      setVaccinationDate(undefined);
      setVaccinationDateInput("");
      setNextDueDate(undefined);
      setNextDueDateInput("");
    }
  }, [open]);

  const handleVaccinationSelect = (id: string, vaccination?: GermanVaccination) => {
    setSelectedVaccinationId(id);
    if (vaccination && id !== "sonstige") {
      // Auto-fill vaccine type based on selection
      setFormData(prev => ({
        ...prev,
        vaccine_type: vaccination.name,
      }));
      setCustomVaccineName("");
    } else {
      setFormData(prev => ({
        ...prev,
        vaccine_type: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vaccinationDate) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie ein Impfdatum an.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVaccinationId) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Impfung aus.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVaccinationId === "sonstige" && !customVaccineName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie den Namen der Impfung ein.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      // Encrypt notes if encryption key is available
      let encryptedNotes = formData.notes || null;
      if (formData.notes && encryptionKey) {
        encryptedNotes = await encryptText(formData.notes, encryptionKey);
      }

      // Determine vaccine name
      const vaccineName = selectedVaccinationId === "sonstige" 
        ? customVaccineName.trim()
        : formData.vaccine_type;

      const { error } = await supabase.from("vaccinations").insert({
        user_id: userId,
        child_id: selectedChildId === "self" ? null : selectedChildId,
        vaccine_name: vaccineName,
        vaccine_type: formData.vaccine_type || vaccineName,
        vaccination_date: format(vaccinationDate, "yyyy-MM-dd"),
        next_due_date: nextDueDate ? format(nextDueDate, "yyyy-MM-dd") : null,
        doctor_name: formData.doctor_name || null,
        batch_number: formData.batch_number || null,
        notes: encryptedNotes,
      });

      if (error) throw error;

      toast({
        title: "Impfung hinzugefügt",
        description: "Die Impfung wurde erfolgreich gespeichert.",
      });

      onOpenChange(false);
      onVaccinationAdded?.();
    } catch (error: any) {
      toast({
        title: "Fehler beim Hinzufügen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Neue Impfung hinzufügen
          </DialogTitle>
          <DialogDescription>
            Tragen Sie die Details der Impfung ein
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Person Selection */}
          <div className="space-y-2">
            <Label htmlFor="person">Für wen ist die Impfung? *</Label>
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Person auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Für mich selbst
                  </span>
                </SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    <span className="flex items-center gap-2">
                      <Baby className="w-4 h-4" />
                      {child.first_name} {child.last_name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Impfung *</Label>
            <VaccinationSelect
              value={selectedVaccinationId}
              onValueChange={handleVaccinationSelect}
              disabled={loading}
              customValue={customVaccineName}
              onCustomValueChange={setCustomVaccineName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccination_date">Impfdatum *</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="TT.MM.JJJJ"
                  value={vaccinationDateInput}
                  onChange={(e) => {
                    setVaccinationDateInput(e.target.value);
                    const parts = e.target.value.split(".");
                    if (parts.length === 3) {
                      const day = parseInt(parts[0]);
                      const month = parseInt(parts[1]) - 1;
                      const year = parseInt(parts[2]);
                      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        const date = new Date(year, month, day);
                        if (date.getDate() === day && date.getMonth() === month) {
                          setVaccinationDate(date);
                        }
                      }
                    }
                  }}
                  className="flex-1"
                  disabled={loading}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(!vaccinationDate && "text-muted-foreground")}
                      disabled={loading}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom">
                    <Calendar
                      mode="single"
                      selected={vaccinationDate}
                      onSelect={(date) => {
                        setVaccinationDate(date);
                        if (date) {
                          setVaccinationDateInput(format(date, "dd.MM.yyyy"));
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus={false}
                      locale={de}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_due_date">Nächste Impfung</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="TT.MM.JJJJ"
                  value={nextDueDateInput}
                  onChange={(e) => {
                    setNextDueDateInput(e.target.value);
                    const parts = e.target.value.split(".");
                    if (parts.length === 3) {
                      const day = parseInt(parts[0]);
                      const month = parseInt(parts[1]) - 1;
                      const year = parseInt(parts[2]);
                      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        const date = new Date(year, month, day);
                        if (date.getDate() === day && date.getMonth() === month) {
                          setNextDueDate(date);
                        }
                      }
                    }
                  }}
                  className="flex-1"
                  disabled={loading}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(!nextDueDate && "text-muted-foreground")}
                      disabled={loading}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom">
                    <Calendar
                      mode="single"
                      selected={nextDueDate}
                      onSelect={(date) => {
                        setNextDueDate(date);
                        if (date) {
                          setNextDueDateInput(format(date, "dd.MM.yyyy"));
                        }
                      }}
                      initialFocus={false}
                      locale={de}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor_name">Arzt / Ärztin</Label>
            <Input
              id="doctor_name"
              placeholder="Dr. med. Müller"
              value={formData.doctor_name}
              onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch_number">Chargennummer</Label>
            <Input
              id="batch_number"
              placeholder="Chargennummer des Impfstoffs"
              value={formData.batch_number}
              onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              Notizen
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                verschlüsselt
              </span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Informationen..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
