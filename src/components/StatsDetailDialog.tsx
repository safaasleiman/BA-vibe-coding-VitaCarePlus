import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Syringe, AlertCircle } from "lucide-react";
import type { Vaccination, VaccinationReminderInfo } from "@/lib/reminderUtils";
import type { Database } from "@/integrations/supabase/types";

interface StatsDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "vaccination" | "examination";
  filter: "all" | "due" | "overdue";
  vaccinations?: Vaccination[];
  vaccinationReminders?: VaccinationReminderInfo[];
  examinations?: Database['public']['Tables']['u_examinations']['Row'][];
  children?: Database['public']['Tables']['children']['Row'][];
}

export const StatsDetailDialog = ({
  open,
  onOpenChange,
  type,
  filter,
  vaccinations = [],
  vaccinationReminders = [],
  examinations = [],
  children = []
}: StatsDetailDialogProps) => {
  const isVaccination = type === "vaccination";

  // Filter Impfungen
  const getFilteredVaccinations = () => {
    if (filter === "all") return vaccinations;
    
    const reminderIds = vaccinationReminders
      .filter(r => filter === "overdue" ? r.isOverdue : !r.isOverdue)
      .map(r => r.vaccination.id);
    
    return vaccinations.filter(v => reminderIds.includes(v.id));
  };

  // Filter U-Untersuchungen
  const getFilteredExaminations = () => {
    if (filter === "all") return examinations;
    
    return examinations.filter(e => {
      if (e.actual_date) return false; // Durchgeführte ignorieren
      const dueDate = new Date(e.due_date);
      const today = new Date();
      
      if (filter === "overdue") {
        return dueDate < today;
      } else {
        return dueDate >= today;
      }
    });
  };

  const filteredVaccinations = isVaccination ? getFilteredVaccinations() : [];
  const filteredExaminations = !isVaccination ? getFilteredExaminations() : [];

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

  const getTitle = () => {
    const typeLabel = isVaccination ? "Impfungen" : "U-Untersuchungen";
    const count = isVaccination ? filteredVaccinations.length : filteredExaminations.length;
    
    if (filter === "all") {
      return `Alle ${typeLabel} (${count})`;
    } else if (filter === "due") {
      return `Fällige ${typeLabel} (${count})`;
    } else {
      return `Überfällige ${typeLabel} (${count})`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {isVaccination ? (
            filteredVaccinations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine Impfungen gefunden
              </p>
            ) : (
              filteredVaccinations.map((vaccination) => {
                const reminder = vaccinationReminders.find(r => r.vaccination.id === vaccination.id);
                const isOverdue = reminder?.isOverdue || false;
                const daysInfo = vaccination.next_due_date 
                  ? getDaysUntil(vaccination.next_due_date)
                  : null;

                return (
                  <Card key={vaccination.id} className={`
                    ${isOverdue ? "border-red-200 dark:border-red-900" : ""}
                    ${!isOverdue && daysInfo ? "border-orange-200 dark:border-orange-900" : ""}
                  `}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${isOverdue ? "text-red-600" : "text-primary"}`}>
                          <Syringe className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{vaccination.vaccine_name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vaccination.vaccine_type}
                          </p>
                          {vaccination.vaccination_date && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Geimpft am: {format(new Date(vaccination.vaccination_date), "dd.MM.yyyy", { locale: de })}
                            </p>
                          )}
                          {vaccination.next_due_date && filter !== "all" && (
                            <div className={`flex items-center gap-2 mt-2 text-sm ${
                              isOverdue 
                                ? "text-red-600 dark:text-red-400" 
                                : "text-orange-600 dark:text-orange-400"
                            }`}>
                              <Calendar className="w-4 h-4" />
                              <span>
                                Fällig am: {format(new Date(vaccination.next_due_date), "dd.MM.yyyy", { locale: de })}
                                {daysInfo && ` (${daysInfo})`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )
          ) : (
            filteredExaminations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine U-Untersuchungen gefunden
              </p>
            ) : (
              filteredExaminations.map((exam) => {
                const dueDate = new Date(exam.due_date);
                const today = new Date();
                const isOverdue = dueDate < today && !exam.actual_date;
                const daysInfo = getDaysUntil(exam.due_date);

                return (
                  <Card key={exam.id} className={`
                    ${isOverdue ? "border-red-200 dark:border-red-900" : ""}
                    ${!isOverdue ? "border-orange-200 dark:border-orange-900" : ""}
                  `}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${isOverdue ? "text-red-600" : "text-primary"}`}>
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{exam.examination_type}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getChildName(exam.child_id)}
                          </p>
                          <div className={`flex items-center gap-2 mt-2 text-sm ${
                            isOverdue 
                              ? "text-red-600 dark:text-red-400" 
                              : "text-orange-600 dark:text-orange-400"
                          }`}>
                            <Calendar className="w-4 h-4" />
                            <span>
                              Fällig am: {format(new Date(exam.due_date), "dd.MM.yyyy", { locale: de })}
                              {` (${daysInfo})`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
