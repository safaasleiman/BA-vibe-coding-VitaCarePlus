import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string | null;
}

interface EditChildDialogProps {
  child: Child;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChildUpdated: () => void;
}

export function EditChildDialog({ child, open, onOpenChange, onChildUpdated }: EditChildDialogProps) {
  const [firstName, setFirstName] = useState(child.first_name);
  const [lastName, setLastName] = useState(child.last_name);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(child.date_of_birth));
  const [dateInput, setDateInput] = useState(format(new Date(child.date_of_birth), "dd.MM.yyyy"));
  const [gender, setGender] = useState<string>(child.gender || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFirstName(child.first_name);
    setLastName(child.last_name);
    setDateOfBirth(new Date(child.date_of_birth));
    setDateInput(format(new Date(child.date_of_birth), "dd.MM.yyyy"));
    setGender(child.gender || "");
  }, [child]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !dateOfBirth) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("children")
        .update({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: format(dateOfBirth, "yyyy-MM-dd"),
          gender: gender || null,
        })
        .eq("id", child.id);

      if (error) throw error;

      toast.success("Kind erfolgreich aktualisiert");
      onOpenChange(false);
      onChildUpdated();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kind bearbeiten</DialogTitle>
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
                        setDateOfBirth(date);
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
                    className={cn(!dateOfBirth && "text-muted-foreground")}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100] bg-popover" align="center" side="top">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={(date) => {
                      if (date) {
                        setDateOfBirth(date);
                        setDateInput(format(date, "dd.MM.yyyy"));
                      }
                    }}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus={false}
                    locale={de}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            {dateOfBirth && (
              <p className="text-sm text-muted-foreground mt-1">
                {format(dateOfBirth, "dd.MM.yyyy")}
              </p>
            )}
          </div>
          <div>
            <Label>Geschlecht</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Geschlecht auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Weiblich</SelectItem>
                <SelectItem value="male">Männlich</SelectItem>
                <SelectItem value="diverse">Divers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird gespeichert..." : "Änderungen speichern"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
