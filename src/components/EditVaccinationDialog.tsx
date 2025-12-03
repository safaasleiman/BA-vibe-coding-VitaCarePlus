import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Pencil, Lock } from "lucide-react";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getEncryptionKey, encryptText, decryptText } from "@/lib/encryption";

interface Vaccination {
  id: string;
  user_id?: string;
  vaccine_name: string;
  vaccine_type: string;
  vaccination_date: string;
  next_due_date: string | null;
  doctor_name: string | null;
  batch_number: string | null;
  notes: string | null;
}

interface EditVaccinationDialogProps {
  vaccination: Vaccination;
  onVaccinationUpdated: () => void;
}

export const EditVaccinationDialog = ({ vaccination, onVaccinationUpdated }: EditVaccinationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const { toast } = useToast();
  
  const [vaccinationDate, setVaccinationDate] = useState<Date>();
  const [vaccinationDateInput, setVaccinationDateInput] = useState("");
  const [nextDueDate, setNextDueDate] = useState<Date>();
  const [nextDueDateInput, setNextDueDateInput] = useState("");
  const [formData, setFormData] = useState({
    vaccine_name: "",
    vaccine_type: "",
    doctor_name: "",
    batch_number: "",
    notes: "",
  });

  // Load encryption key
  useEffect(() => {
    if (vaccination.user_id) {
      getEncryptionKey(vaccination.user_id).then(setEncryptionKey);
    }
  }, [vaccination.user_id]);

  useEffect(() => {
    const loadData = async () => {
      if (open && vaccination) {
        let decryptedNotes = vaccination.notes || "";
        
        // Decrypt notes if encrypted
        if (vaccination.notes && vaccination.user_id) {
          const key = await getEncryptionKey(vaccination.user_id);
          decryptedNotes = await decryptText(vaccination.notes, key);
        }

        setFormData({
          vaccine_name: vaccination.vaccine_name,
          vaccine_type: vaccination.vaccine_type,
          doctor_name: vaccination.doctor_name || "",
          batch_number: vaccination.batch_number || "",
          notes: decryptedNotes,
        });
        
        const vaxDate = new Date(vaccination.vaccination_date);
        setVaccinationDate(vaxDate);
        setVaccinationDateInput(format(vaxDate, "dd.MM.yyyy"));
        
        if (vaccination.next_due_date) {
          const nextDate = new Date(vaccination.next_due_date);
          setNextDueDate(nextDate);
          setNextDueDateInput(format(nextDate, "dd.MM.yyyy"));
        } else {
          setNextDueDate(undefined);
          setNextDueDateInput("");
        }
      }
    };
    loadData();
  }, [open, vaccination]);

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
    
    setLoading(true);

    try {
      // Encrypt notes if encryption key is available
      let encryptedNotes = formData.notes || null;
      if (formData.notes && encryptionKey) {
        encryptedNotes = await encryptText(formData.notes, encryptionKey);
      }

      const { error } = await supabase
        .from("vaccinations")
        .update({
          vaccine_name: formData.vaccine_name,
          vaccine_type: formData.vaccine_type,
          vaccination_date: format(vaccinationDate, "yyyy-MM-dd"),
          next_due_date: nextDueDate ? format(nextDueDate, "yyyy-MM-dd") : null,
          doctor_name: formData.doctor_name || null,
          batch_number: formData.batch_number || null,
          notes: encryptedNotes,
        })
        .eq("id", vaccination.id);

      if (error) throw error;

      toast({
        title: "Impfung aktualisiert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });

      setOpen(false);
      onVaccinationUpdated();
    } catch (error: any) {
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseDateInput = (value: string, setter: (date: Date | undefined) => void) => {
    const parts = value.split(".");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month, day);
        if (date.getDate() === day && date.getMonth() === month) {
          setter(date);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Impfung bearbeiten
          </DialogTitle>
          <DialogDescription>
            Ändern Sie die Details der Impfung
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_vaccine_name">Impfstoff *</Label>
            <Input
              id="edit_vaccine_name"
              placeholder="z.B. COVID-19 Moderna"
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_vaccine_type">Impfungstyp *</Label>
            <Input
              id="edit_vaccine_type"
              placeholder="z.B. COVID-19, Grippe, Tetanus"
              value={formData.vaccine_type}
              onChange={(e) => setFormData({ ...formData, vaccine_type: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_vaccination_date">Impfdatum *</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="TT.MM.JJJJ"
                  value={vaccinationDateInput}
                  onChange={(e) => {
                    setVaccinationDateInput(e.target.value);
                    parseDateInput(e.target.value, setVaccinationDate);
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
                  <PopoverContent className="w-auto p-0" align="center" side="top">
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
              <Label htmlFor="edit_next_due_date">Nächste Impfung</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="TT.MM.JJJJ"
                  value={nextDueDateInput}
                  onChange={(e) => {
                    setNextDueDateInput(e.target.value);
                    parseDateInput(e.target.value, setNextDueDate);
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
                  <PopoverContent className="w-auto p-0" align="center" side="top">
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
            <Label htmlFor="edit_doctor_name">Arzt / Ärztin</Label>
            <Input
              id="edit_doctor_name"
              placeholder="Dr. med. Müller"
              value={formData.doctor_name}
              onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_batch_number">Chargennummer</Label>
            <Input
              id="edit_batch_number"
              placeholder="Chargennummer des Impfstoffs"
              value={formData.batch_number}
              onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_notes" className="flex items-center gap-2">
              Notizen
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                verschlüsselt
              </span>
            </Label>
            <Textarea
              id="edit_notes"
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
              onClick={() => setOpen(false)}
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
