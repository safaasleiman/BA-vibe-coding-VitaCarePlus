import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Clock, AlertCircle, Syringe, ClipboardList, User, Baby } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Vaccination, VaccinationReminderInfo } from "@/lib/reminderUtils";
import type { Database } from "@/integrations/supabase/types";

interface CombinedOverviewCardProps {
  vaccinations?: Vaccination[];
  vaccinationReminders?: VaccinationReminderInfo[];
  examinations?: Database['public']['Tables']['u_examinations']['Row'][];
  children?: Database['public']['Tables']['children']['Row'][];
}

export const CombinedOverviewCard = ({
  vaccinations = [],
  vaccinationReminders = [],
  examinations = [],
  children = []
}: CombinedOverviewCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Statistiken berechnen
  const vaccinationCount = vaccinations.length;
  const examinationCount = examinations.length;
  
  const vaccinationDueCount = vaccinationReminders.filter(r => !r.isOverdue).length;
  const vaccinationOverdueCount = vaccinationReminders.filter(r => r.isOverdue).length;
  
  const uExamDueCount = examinations.filter(e => !e.actual_date && new Date(e.due_date) >= new Date()).length;
  const uExamOverdueCount = examinations.filter(e => !e.actual_date && new Date(e.due_date) < new Date()).length;

  const totalDue = vaccinationDueCount + uExamDueCount;
  const totalOverdue = vaccinationOverdueCount + uExamOverdueCount;

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.first_name} ${child.last_name}` : "";
  };

  const getDaysUntil = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} Tage überfällig`;
    } else if (diffDays === 0) {
      return "Heute fällig";
    } else if (diffDays === 1) {
      return "Morgen fällig";
    } else {
      return `in ${diffDays} Tagen`;
    }
  };

  // Fällige Impfungen
  const dueVaccinations = vaccinations.filter(v => 
    vaccinationReminders.some(r => r.vaccination.id === v.id && !r.isOverdue)
  );
  const overdueVaccinations = vaccinations.filter(v => 
    vaccinationReminders.some(r => r.vaccination.id === v.id && r.isOverdue)
  );

  // Fällige U-Untersuchungen
  const dueExaminations = examinations.filter(e => !e.actual_date && new Date(e.due_date) >= new Date());
  const overdueExaminations = examinations.filter(e => !e.actual_date && new Date(e.due_date) < new Date());

  return (
    <>
      <Card 
        className="shadow-soft border-border/50 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setDialogOpen(true)}
      >
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Terminübersicht
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Gesamt */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Gesamt</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Syringe className="w-3 h-3 text-muted-foreground" />
                <span className="font-bold text-primary">{vaccinationCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClipboardList className="w-3 h-3 text-muted-foreground" />
                <span className="font-bold text-primary">{examinationCount}</span>
              </div>
            </div>
          </div>

          {/* Fällig */}
          {totalDue > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium">Fällig</span>
              </div>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {totalDue}
              </span>
            </div>
          )}

          {/* Überfällig */}
          {totalOverdue > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium">Überfällig</span>
              </div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {totalOverdue}
              </span>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center pt-2">
            Klicken für Details
          </p>
        </CardContent>
      </Card>

      {/* Dialog mit 2-Spalten-Ansicht */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terminübersicht</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Linke Spalte: Impfungen */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Syringe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Impfungen</h3>
                <span className="ml-auto text-sm text-muted-foreground">
                  {vaccinationCount} gesamt
                </span>
              </div>

              {/* Überfällige Impfungen */}
              {overdueVaccinations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Überfällig ({overdueVaccinations.length})
                  </h4>
                  {overdueVaccinations.map((v) => (
                    <Card key={v.id} className="border-red-200 dark:border-red-900">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{v.vaccine_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{v.vaccine_type}</span>
                          <span className="flex items-center gap-1">
                            {v.child_id ? <Baby className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {v.child_id ? getChildName(v.child_id) : "Für mich"}
                          </span>
                        </div>
                        {v.next_due_date && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {format(new Date(v.next_due_date), "dd.MM.yyyy", { locale: de })} ({getDaysUntil(v.next_due_date)})
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Fällige Impfungen */}
              {dueVaccinations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Demnächst fällig ({dueVaccinations.length})
                  </h4>
                  {dueVaccinations.map((v) => (
                    <Card key={v.id} className="border-orange-200 dark:border-orange-900">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{v.vaccine_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{v.vaccine_type}</span>
                          <span className="flex items-center gap-1">
                            {v.child_id ? <Baby className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {v.child_id ? getChildName(v.child_id) : "Für mich"}
                          </span>
                        </div>
                        {v.next_due_date && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            {format(new Date(v.next_due_date), "dd.MM.yyyy", { locale: de })} ({getDaysUntil(v.next_due_date)})
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {overdueVaccinations.length === 0 && dueVaccinations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine anstehenden Impfungen
                </p>
              )}
            </div>

            {/* Rechte Spalte: U-Untersuchungen */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <ClipboardList className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">U-Untersuchungen</h3>
                <span className="ml-auto text-sm text-muted-foreground">
                  {examinationCount} gesamt
                </span>
              </div>

              {/* Überfällige U-Untersuchungen */}
              {overdueExaminations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Überfällig ({overdueExaminations.length})
                  </h4>
                  {overdueExaminations.map((e) => (
                    <Card key={e.id} className="border-red-200 dark:border-red-900">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{e.examination_type}</p>
                        <p className="text-xs text-muted-foreground">{getChildName(e.child_id)}</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {format(new Date(e.due_date), "dd.MM.yyyy", { locale: de })} ({getDaysUntil(e.due_date)})
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Fällige U-Untersuchungen */}
              {dueExaminations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Demnächst fällig ({dueExaminations.length})
                  </h4>
                  {dueExaminations.map((e) => (
                    <Card key={e.id} className="border-orange-200 dark:border-orange-900">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{e.examination_type}</p>
                        <p className="text-xs text-muted-foreground">{getChildName(e.child_id)}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          {format(new Date(e.due_date), "dd.MM.yyyy", { locale: de })} ({getDaysUntil(e.due_date)})
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {overdueExaminations.length === 0 && dueExaminations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine anstehenden U-Untersuchungen
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
