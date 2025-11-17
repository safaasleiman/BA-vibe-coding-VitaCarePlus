import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface AddVaccinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const AddVaccinationDialog = ({ open, onOpenChange, userId }: AddVaccinationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    vaccine_name: "",
    vaccine_type: "",
    vaccination_date: "",
    next_due_date: "",
    doctor_name: "",
    batch_number: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("vaccinations").insert({
        user_id: userId,
        vaccine_name: formData.vaccine_name,
        vaccine_type: formData.vaccine_type,
        vaccination_date: formData.vaccination_date,
        next_due_date: formData.next_due_date || null,
        doctor_name: formData.doctor_name || null,
        batch_number: formData.batch_number || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Impfung hinzugefügt",
        description: "Die Impfung wurde erfolgreich gespeichert.",
      });

      // Reset form and close dialog
      setFormData({
        vaccine_name: "",
        vaccine_type: "",
        vaccination_date: "",
        next_due_date: "",
        doctor_name: "",
        batch_number: "",
        notes: "",
      });
      onOpenChange(false);
      
      // Trigger a refresh by reloading vaccinations
      window.location.reload();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Neue Impfung hinzufügen
          </DialogTitle>
          <DialogDescription>
            Tragen Sie die Details Ihrer Impfung ein
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vaccine_name">Impfstoff *</Label>
            <Input
              id="vaccine_name"
              placeholder="z.B. COVID-19 Moderna"
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaccine_type">Impfungstyp *</Label>
            <Input
              id="vaccine_type"
              placeholder="z.B. COVID-19, Grippe, Tetanus"
              value={formData.vaccine_type}
              onChange={(e) => setFormData({ ...formData, vaccine_type: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccination_date">Impfdatum *</Label>
              <Input
                id="vaccination_date"
                type="date"
                value={formData.vaccination_date}
                onChange={(e) => setFormData({ ...formData, vaccination_date: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_due_date">Nächste Impfung</Label>
              <Input
                id="next_due_date"
                type="date"
                value={formData.next_due_date}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                disabled={loading}
              />
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
            <Label htmlFor="notes">Notizen</Label>
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
