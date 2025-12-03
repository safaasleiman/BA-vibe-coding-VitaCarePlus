import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Trash2, AlertCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { EditVaccinationDialog } from "./EditVaccinationDialog";
import { getEncryptionKey, decryptText, isEncrypted } from "@/lib/encryption";

interface Vaccination {
  id: string;
  user_id: string;
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
  onVaccinationChange?: () => void;
}

export const VaccinationList = ({ userId, onVaccinationChange }: VaccinationListProps) => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [decryptedNotes, setDecryptedNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'due'>('all');
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

      // Decrypt notes
      if (data) {
        const key = await getEncryptionKey(userId);
        const decrypted: Record<string, string> = {};
        for (const vax of data) {
          if (vax.notes) {
            decrypted[vax.id] = await decryptText(vax.notes, key);
          }
        }
        setDecryptedNotes(decrypted);
      }
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
      onVaccinationChange?.();
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
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Alle
        </Button>
        <Button
          variant={filter === 'due' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('due')}
        >
          Nur fällige
        </Button>
      </div>

      {vaccinations
        .filter((vaccination) => {
          if (filter === 'all') return true;
          const isDue = vaccination.next_due_date && 
            new Date(vaccination.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return isDue;
        })
        .sort((a, b) => {
          // Sortiere fällige Impfungen zuerst
          const aDue = a.next_due_date && 
            new Date(a.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const bDue = b.next_due_date && 
            new Date(b.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          
          if (aDue && !bDue) return -1;
          if (!aDue && bDue) return 1;
          
          // Dann nach Fälligkeitsdatum oder Impfdatum
          if (a.next_due_date && b.next_due_date) {
            return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime();
          }
          return new Date(b.vaccination_date).getTime() - new Date(a.vaccination_date).getTime();
        })
        .map((vaccination) => {
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
                    <p className="text-sm text-muted-foreground italic flex items-center gap-1">
                      {isEncrypted(vaccination.notes) && <Lock className="w-3 h-3" />}
                      {decryptedNotes[vaccination.id] || vaccination.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <EditVaccinationDialog 
                    vaccination={vaccination}
                    onVaccinationUpdated={() => {
                      fetchVaccinations();
                      onVaccinationChange?.();
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(vaccination.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
