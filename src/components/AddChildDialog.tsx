import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateAllDueDates } from "@/lib/uExaminationsCalculator";

interface AddChildDialogProps {
  onChildAdded: () => void;
}

export function AddChildDialog({ onChildAdded }: AddChildDialogProps) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !dateOfBirth) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht angemeldet");
        return;
      }

      // Insert child
      const { data: child, error: childError } = await supabase
        .from("children")
        .insert({
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: format(dateOfBirth, "yyyy-MM-dd"),
        })
        .select()
        .single();

      if (childError) throw childError;

      // Generate all U-examinations with due dates
      const dueDates = generateAllDueDates(dateOfBirth);
      const uExaminations = dueDates.map(exam => ({
        child_id: child.id,
        user_id: user.id,
        examination_type: exam.type,
        due_date: format(exam.dueDate, "yyyy-MM-dd"),
      }));

      const { error: examError } = await supabase
        .from("u_examinations")
        .insert(uExaminations);

      if (examError) throw examError;

      toast.success("Kind erfolgreich angelegt");
      setOpen(false);
      setFirstName("");
      setLastName("");
      setDateOfBirth(undefined);
      onChildAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Kind hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Kind anlegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">Vorname</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Vorname"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nachname</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nachname"
            />
          </div>
          <div>
            <Label>Geburtsdatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, "PPP", { locale: de }) : "Datum wählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird gespeichert..." : "Kind anlegen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
