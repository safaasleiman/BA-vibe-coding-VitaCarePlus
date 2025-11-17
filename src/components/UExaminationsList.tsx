import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isPast, isFuture } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";
import { AddUExaminationDialog } from "./AddUExaminationDialog";
import { exportUExaminationToCalendar } from "@/lib/icsGenerator";
import { U_EXAMINATIONS } from "@/lib/uExaminationsCalculator";

interface UExamination {
  id: string;
  examination_type: string;
  due_date: string;
  actual_date: string | null;
  doctor_name: string | null;
  notes: string | null;
}

interface UExaminationsListProps {
  childId?: string;
  childName?: string;
  refreshTrigger: number;
}

export function UExaminationsList({ childId, childName, refreshTrigger }: UExaminationsListProps) {
  const [examinations, setExaminations] = useState<UExamination[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExaminations = async () => {
    if (!childId) {
      setExaminations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("u_examinations")
        .select("*")
        .eq("child_id", childId)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setExaminations(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExaminations();
  }, [childId, refreshTrigger]);

  const getStatus = (exam: UExamination) => {
    if (exam.actual_date) {
      return { label: "Durchgeführt", variant: "success" as const, icon: CheckCircle2 };
    }
    const dueDate = new Date(exam.due_date);
    if (isPast(dueDate)) {
      return { label: "Überfällig", variant: "destructive" as const, icon: AlertCircle };
    }
    return { label: "Ausstehend", variant: "secondary" as const, icon: Clock };
  };

  const handleExportToCalendar = (exam: UExamination) => {
    if (!childName) {
      toast.error("Kindername nicht verfügbar");
      return;
    }

    const examInfo = U_EXAMINATIONS.find(u => u.type === exam.examination_type);
    const description = examInfo?.description || '';

    exportUExaminationToCalendar(
      exam.examination_type,
      exam.due_date,
      childName,
      description
    );

    toast.success(`${exam.examination_type} als Kalendereintrag exportiert`);
  };

  if (!childId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Bitte wählen Sie ein Kind aus
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <div className="text-muted-foreground">Lädt...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>U-Untersuchungen</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Untersuchung</TableHead>
              <TableHead>Soll-Datum</TableHead>
              <TableHead>Ist-Datum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px]">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examinations.map((exam) => {
              const status = getStatus(exam);
              const StatusIcon = status.icon;
              
              return (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.examination_type}</TableCell>
                  <TableCell>
                    {format(new Date(exam.due_date), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>
                    {exam.actual_date 
                      ? format(new Date(exam.actual_date), "dd.MM.yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportToCalendar(exam)}
                        title="Als Kalendereintrag exportieren"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <AddUExaminationDialog 
                        examination={exam}
                        onExaminationUpdated={fetchExaminations}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
