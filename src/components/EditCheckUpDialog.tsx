import { useState, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CheckUp {
  id: string;
  user_id: string;
  check_up_type: string;
  due_date: string;
  actual_date: string | null;
  doctor_name: string | null;
  notes: string | null;
  interval_months: number;
}

interface EditCheckUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkUp: CheckUp;
  onCheckUpUpdated: () => void;
  onCheckUpDeleted: () => void;
}

export const EditCheckUpDialog = ({
  open,
  onOpenChange,
  checkUp,
  onCheckUpUpdated,
  onCheckUpDeleted,
}: EditCheckUpDialogProps) => {
  const [dueDate, setDueDate] = useState<Date>();
  const [actualDate, setActualDate] = useState<Date | undefined>();
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [intervalMonths, setIntervalMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (checkUp) {
      setDueDate(new Date(checkUp.due_date));
      setActualDate(checkUp.actual_date ? new Date(checkUp.actual_date) : undefined);
      setDoctorName(checkUp.doctor_name || "");
      setNotes(checkUp.notes || "");
      setIntervalMonths(checkUp.interval_months);
    }
  }, [checkUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('check_ups')
        .update({
          due_date: format(dueDate, 'yyyy-MM-dd'),
          actual_date: actualDate ? format(actualDate, 'yyyy-MM-dd') : null,
          doctor_name: doctorName || null,
          notes: notes || null,
          interval_months: intervalMonths,
        })
        .eq('id', checkUp.id);

      if (error) throw error;

      toast({
        title: "Check-up aktualisiert",
        description: "Die Änderungen wurden gespeichert.",
      });

      onCheckUpUpdated();
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

  const clearActualDate = () => {
    setActualDate(undefined);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{checkUp.check_up_type} bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Details dieser Vorsorgeuntersuchung.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Durchführungsdatum</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !actualDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {actualDate ? format(actualDate, "dd.MM.yyyy", { locale: de }) : "Noch nicht durchgeführt"}
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
                {actualDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={clearActualDate}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading || !dueDate} className="flex-1">
                {loading ? "Speichert..." : "Speichern"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check-up löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie "{checkUp.check_up_type}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCheckUpDeleted}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
