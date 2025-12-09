import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit, X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UExamination {
  id: string;
  examination_type: string;
  due_date: string;
  actual_date: string | null;
  doctor_name: string | null;
  notes: string | null;
}

interface AddUExaminationDialogProps {
  examination: UExamination;
  onExaminationUpdated: () => void;
}

export function AddUExaminationDialog({ examination, onExaminationUpdated }: AddUExaminationDialogProps) {
  const [open, setOpen] = useState(false);
  const [actualDate, setActualDate] = useState<Date | undefined>(
    examination.actual_date ? new Date(examination.actual_date) : undefined
  );
  const [dateInput, setDateInput] = useState(
    examination.actual_date ? format(new Date(examination.actual_date), "dd.MM.yyyy") : ""
  );
  const [doctorName, setDoctorName] = useState(examination.doctor_name || "");
  const [notes, setNotes] = useState(examination.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("u_examinations")
        .update({
          actual_date: actualDate ? format(actualDate, "yyyy-MM-dd") : null,
          doctor_name: doctorName || null,
          notes: notes || null,
        })
        .eq("id", examination.id);

      if (error) throw error;

      toast.success("U-Untersuchung aktualisiert");
      setOpen(false);
      onExaminationUpdated();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{examination.examination_type} - Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Soll-Datum</Label>
            <Input 
              value={format(new Date(examination.due_date), "dd.MM.yyyy")} 
              disabled 
              className="bg-muted"
            />
          </div>
          <div>
            <Label>Tatsächliches Datum</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="TT.MM.JJJJ"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                  const parts = e.target.value.split(".");
                  if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                      const date = new Date(year, month, day);
                      if (date.getDate() === day && date.getMonth() === month) {
                        setActualDate(date);
                      }
                    }
                  }
                }}
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(!actualDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="top">
                  <Calendar
                    mode="single"
                    selected={actualDate}
                    onSelect={(date) => {
                      setActualDate(date);
                      if (date) {
                        setDateInput(format(date, "dd.MM.yyyy"));
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus={false}
                    locale={de}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {actualDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setActualDate(undefined);
                    setDateInput("");
                  }}
                  title="Datum zurücksetzen"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {actualDate && (
              <p className="text-sm text-muted-foreground mt-1">
                {format(actualDate, "dd.MM.yyyy")}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="doctorName">Arzt/Ärztin</Label>
            <Input
              id="doctorName"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Name des Arztes/der Ärztin"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Notizen..."
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
