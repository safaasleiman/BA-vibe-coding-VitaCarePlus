import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Vaccination {
  id: string;
  vaccine_name: string;
  vaccine_type: string;
  vaccination_date: string;
  next_due_date: string | null;
  doctor_name: string | null;
  batch_number: string | null;
  notes: string | null;
}

interface VaccinationListProps {
  userId: string;
}

export const VaccinationList = ({ userId }: VaccinationListProps) => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVaccinations = async () => {
    try {
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*")
        .eq("user_id", userId)
        .order("vaccination_date", { ascending: false });

      if (error) throw error;
      setVaccinations(data || []);
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diese Impfung wirklich löschen?")) return;

    try {
      const { error } = await supabase
        .from("vaccinations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolgreich gelöscht",
        description: "Die Impfung wurde entfernt.",
      });
      
      fetchVaccinations();
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (vaccinations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Keine Impfungen vorhanden</h3>
        <p className="text-muted-foreground text-sm">
          Fügen Sie Ihre erste Impfung hinzu, um loszulegen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vaccinations.map((vaccination) => {
        const isDue = vaccination.next_due_date && 
          new Date(vaccination.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        return (
          <Card key={vaccination.id} className="border-border/50 shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {vaccination.vaccine_name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {vaccination.vaccine_type}
                    </Badge>
                    {isDue && (
                      <Badge variant="destructive" className="text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Fällig
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(vaccination.vaccination_date), "dd. MMMM yyyy", { locale: de })}
                      </span>
                    </div>
                    {vaccination.next_due_date && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">Nächste:</span>
                        <span>
                          {format(new Date(vaccination.next_due_date), "dd. MMM yyyy", { locale: de })}
                        </span>
                      </div>
                    )}
                  </div>

                  {vaccination.doctor_name && (
                    <p className="text-sm text-muted-foreground">
                      Arzt: {vaccination.doctor_name}
                    </p>
                  )}

                  {vaccination.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {vaccination.notes}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(vaccination.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
