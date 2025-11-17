import { differenceInDays, isPast, parseISO } from 'date-fns';

export interface UExamination {
  id: string;
  examination_type: string;
  due_date: string;
  actual_date: string | null;
  child_id: string;
}

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
}

export interface ReminderInfo {
  examination: UExamination;
  child: Child;
  daysUntilDue: number;
  isOverdue: boolean;
  urgency: 'overdue' | 'urgent' | 'upcoming';
}

export function getUpcomingExaminations(
  examinations: UExamination[],
  children: Child[],
  daysBeforeDue: number = 30
): ReminderInfo[] {
  const now = new Date();
  
  const reminders = examinations
    .filter(exam => !exam.actual_date) // Nur nicht durchgeführte Untersuchungen
    .map(exam => {
      const dueDate = parseISO(exam.due_date);
      const daysUntilDue = differenceInDays(dueDate, now);
      const isOverdue = isPast(dueDate);
      const child = children.find(c => c.id === exam.child_id);
      
      if (!child) return null;
      
      // Bestimme Dringlichkeit
      let urgency: 'overdue' | 'urgent' | 'upcoming';
      if (isOverdue) {
        urgency = 'overdue';
      } else if (daysUntilDue <= 7) {
        urgency = 'urgent';
      } else {
        urgency = 'upcoming';
      }
      
      return {
        examination: exam,
        child,
        daysUntilDue,
        isOverdue,
        urgency
      };
    })
    .filter((r): r is ReminderInfo => r !== null)
    .filter(r => r.isOverdue || r.daysUntilDue <= daysBeforeDue)
    .sort((a, b) => {
      // Überfällige zuerst, dann nach Datum sortieren
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.daysUntilDue - b.daysUntilDue;
    });
  
  return reminders;
}

export function formatReminderMessage(reminder: ReminderInfo): string {
  const childName = `${reminder.child.first_name} ${reminder.child.last_name}`;
  const examType = reminder.examination.examination_type;
  
  if (reminder.isOverdue) {
    const daysOverdue = Math.abs(reminder.daysUntilDue);
    return `${childName} - ${examType} ist ${daysOverdue} Tag${daysOverdue === 1 ? '' : 'e'} überfällig`;
  }
  
  if (reminder.daysUntilDue === 0) {
    return `${childName} - ${examType} ist heute fällig`;
  }
  
  if (reminder.daysUntilDue === 1) {
    return `${childName} - ${examType} ist morgen fällig`;
  }
  
  return `${childName} - ${examType} ist in ${reminder.daysUntilDue} Tagen fällig`;
}

export function getReminderSummary(reminders: ReminderInfo[]): {
  overdueCount: number;
  urgentCount: number;
  upcomingCount: number;
  totalCount: number;
} {
  const overdueCount = reminders.filter(r => r.urgency === 'overdue').length;
  const urgentCount = reminders.filter(r => r.urgency === 'urgent').length;
  const upcomingCount = reminders.filter(r => r.urgency === 'upcoming').length;
  
  return {
    overdueCount,
    urgentCount,
    upcomingCount,
    totalCount: reminders.length
  };
}
