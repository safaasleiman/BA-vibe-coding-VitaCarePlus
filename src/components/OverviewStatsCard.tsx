import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { StatsDetailDialog } from "./StatsDetailDialog";
import type { Vaccination, VaccinationReminderInfo } from "@/lib/reminderUtils";
import type { Database } from "@/integrations/supabase/types";

interface OverviewStatsCardProps {
  type: "vaccination" | "examination";
  vaccinations?: Vaccination[];
  vaccinationReminders?: VaccinationReminderInfo[];
  examinations?: Database['public']['Tables']['u_examinations']['Row'][];
  children?: Database['public']['Tables']['children']['Row'][];
}

export const OverviewStatsCard = ({
  type,
  vaccinations = [],
  vaccinationReminders = [],
  examinations = [],
  children = []
}: OverviewStatsCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogFilter, setDialogFilter] = useState<"all" | "due" | "overdue">("all");

  const isVaccination = type === "vaccination";
  
  // Berechne Statistiken basierend auf Typ
  const totalCount = isVaccination ? vaccinations.length : examinations.length;
  
  const reminders = isVaccination ? vaccinationReminders : [];
  const dueCount = reminders.filter(r => !r.isOverdue).length;
  const overdueCount = reminders.filter(r => r.isOverdue).length;

  // Für U-Untersuchungen: Berechne fällig und überfällig
  const uExamDueCount = !isVaccination 
    ? examinations.filter(e => !e.actual_date && new Date(e.due_date) >= new Date()).length 
    : 0;
  const uExamOverdueCount = !isVaccination 
    ? examinations.filter(e => !e.actual_date && new Date(e.due_date) < new Date()).length 
    : 0;

  const handleClick = (filter: "all" | "due" | "overdue") => {
    setDialogFilter(filter);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Alle Einträge */}
          <button
            onClick={() => handleClick("all")}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {isVaccination ? "Impfungen" : "U-Untersuchungen"}
              </span>
            </div>
            <span className="text-lg font-bold text-primary">{totalCount}</span>
          </button>

          {/* Fällige Einträge */}
          {(isVaccination ? dueCount : uExamDueCount) > 0 && (
            <button
              onClick={() => handleClick("due")}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium">Fällig</span>
              </div>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {isVaccination ? dueCount : uExamDueCount}
              </span>
            </button>
          )}

          {/* Überfällige Einträge */}
          {(isVaccination ? overdueCount : uExamOverdueCount) > 0 && (
            <button
              onClick={() => handleClick("overdue")}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium">Überfällig</span>
              </div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {isVaccination ? overdueCount : uExamOverdueCount}
              </span>
            </button>
          )}
        </CardContent>
      </Card>

      <StatsDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={type}
        filter={dialogFilter}
        vaccinations={vaccinations}
        vaccinationReminders={vaccinationReminders}
        examinations={examinations}
        children={children}
      />
    </>
  );
};
