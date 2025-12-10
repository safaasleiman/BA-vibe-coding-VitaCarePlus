import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, AlertCircle, CheckCircle2, Clock, Stethoscope } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";
import { generateCheckUpSchedule, ADULT_CHECK_UPS } from "@/lib/checkUpCalculator";
import { AddCheckUpDialog } from "./AddCheckUpDialog";
import { EditCheckUpDialog } from "./EditCheckUpDialog";
import { useToast } from "@/hooks/use-toast";

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

interface CheckUpsListProps {
  userId: string;
  dateOfBirth: string | null;
  gender: string | null;
  refreshTrigger?: number;
  onCheckUpUpdated?: () => void;
}

export const CheckUpsList = ({
  userId,
  dateOfBirth,
  gender,
  refreshTrigger = 0,
  onCheckUpUpdated,
}: CheckUpsListProps) => {
  const [checkUps, setCheckUps] = useState<CheckUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCheckUp, setEditingCheckUp] = useState<CheckUp | null>(null);
  const { toast } = useToast();

  const fetchCheckUps = async () => {
    try {
      const { data, error } = await supabase
        .from('check_ups')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setCheckUps(data || []);
    } catch (error: any) {
      console.error('Fehler beim Laden der Check-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCheckUps();
    }
  }, [userId, refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('check_ups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Check-up gelöscht",
        description: "Der Termin wurde erfolgreich entfernt.",
      });

      fetchCheckUps();
      onCheckUpUpdated?.();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (checkUp: CheckUp) => {
    if (checkUp.actual_date) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Erledigt
        </Badge>
      );
    }

    const dueDate = new Date(checkUp.due_date);
    const daysUntil = differenceInDays(dueDate, new Date());

    if (isPast(dueDate)) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Überfällig
        </Badge>
      );
    }

    if (daysUntil <= 30) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
          <Clock className="w-3 h-3 mr-1" />
          Bald fällig
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <Calendar className="w-3 h-3 mr-1" />
        Geplant
      </Badge>
    );
  };

  const applicableCheckUps = dateOfBirth && gender
    ? generateCheckUpSchedule(new Date(dateOfBirth), gender as 'male' | 'female' | 'diverse')
    : [];

  // Get check-up types that haven't been added yet
  const existingTypes = new Set(checkUps.map(c => c.check_up_type));
  const missingCheckUps = applicableCheckUps.filter(c => !existingTypes.has(c.type));

  if (!dateOfBirth || !gender) {
    return (
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Check-ups
          </CardTitle>
          <CardDescription>
            Bitte vervollständigen Sie Ihr Profil (Geburtsdatum und Geschlecht), um personalisierte Check-up-Empfehlungen zu erhalten.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="shadow-soft border-border/50">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Lädt Check-ups...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Meine Check-ups
              </CardTitle>
              <CardDescription>
                Vorsorgeuntersuchungen basierend auf Ihrem Alter und Geschlecht
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Missing recommended check-ups */}
          {missingCheckUps.length > 0 && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Empfohlene Untersuchungen
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingCheckUps.map((checkUp) => (
                  <Badge 
                    key={checkUp.type} 
                    variant="outline" 
                    className="bg-white text-blue-700 border-blue-300 cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      setShowAddDialog(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {checkUp.type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Existing check-ups */}
          {checkUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Check-ups erfasst.</p>
              <p className="text-sm mt-1">
                Klicken Sie auf "Hinzufügen" um zu beginnen.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkUps.map((checkUp) => (
                <div
                  key={checkUp.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => setEditingCheckUp(checkUp)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{checkUp.check_up_type}</h4>
                        {getStatusBadge(checkUp)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Fällig: {format(new Date(checkUp.due_date), "dd. MMMM yyyy", { locale: de })}
                      </p>
                      {checkUp.actual_date && (
                        <p className="text-sm text-green-600">
                          Durchgeführt: {format(new Date(checkUp.actual_date), "dd. MMMM yyyy", { locale: de })}
                        </p>
                      )}
                      {checkUp.doctor_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Arzt: {checkUp.doctor_name}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      alle {checkUp.interval_months} Monate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddCheckUpDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        userId={userId}
        dateOfBirth={dateOfBirth}
        gender={gender}
        onCheckUpAdded={() => {
          fetchCheckUps();
          onCheckUpUpdated?.();
        }}
      />

      {editingCheckUp && (
        <EditCheckUpDialog
          open={!!editingCheckUp}
          onOpenChange={(open) => !open && setEditingCheckUp(null)}
          checkUp={editingCheckUp}
          onCheckUpUpdated={() => {
            fetchCheckUps();
            onCheckUpUpdated?.();
            setEditingCheckUp(null);
          }}
          onCheckUpDeleted={() => {
            handleDelete(editingCheckUp.id);
            setEditingCheckUp(null);
          }}
        />
      )}
    </>
  );
};
