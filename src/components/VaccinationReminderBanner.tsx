import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, AlertCircle, Clock, Calendar } from 'lucide-react';
import { VaccinationReminderInfo, formatVaccinationReminderMessage, getVaccinationReminderSummary } from '@/lib/reminderUtils';

interface VaccinationReminderBannerProps {
  reminders: VaccinationReminderInfo[];
  onDismiss: () => void;
  onReminderClick: () => void;
}

export function VaccinationReminderBanner({ reminders, onDismiss, onReminderClick }: VaccinationReminderBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissedAt = sessionStorage.getItem('vaccinationReminderDismissedAt');
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt);
      const hoursSinceDismissed = (Date.now() - dismissedTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 1) {
        setIsVisible(false);
      }
    }
  }, []);

  if (!isVisible || reminders.length === 0) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem('vaccinationReminderDismissedAt', new Date().toISOString());
    setIsVisible(false);
    onDismiss();
  };

  const summary = getVaccinationReminderSummary(reminders);
  
  // Bestimme Variant und Icon basierend auf Dringlichkeit
  let variant: 'default' | 'destructive' = 'default';
  let Icon = Calendar;
  let title = '';
  let bgClass = 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';

  if (summary.overdueCount > 0) {
    variant = 'destructive';
    Icon = AlertCircle;
    title = `${summary.overdueCount} Impfung${summary.overdueCount === 1 ? '' : 'en'} überfällig!`;
    bgClass = 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  } else if (summary.urgentCount > 0) {
    Icon = Clock;
    title = `${summary.urgentCount} Impfung${summary.urgentCount === 1 ? '' : 'en'} dringend fällig`;
    bgClass = 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
  } else {
    title = `${summary.totalCount} Impfung${summary.totalCount === 1 ? '' : 'en'} demnächst fällig`;
  }

  return (
    <Alert 
      variant={variant} 
      className={`relative cursor-pointer transition-all hover:shadow-md ${bgClass}`}
      onClick={onReminderClick}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle className="mb-2 pr-8">{title}</AlertTitle>
      <AlertDescription>
        <ul className="space-y-1">
          {reminders.slice(0, 3).map((reminder) => (
            <li key={reminder.vaccination.id} className="text-sm">
              • {formatVaccinationReminderMessage(reminder)}
            </li>
          ))}
          {reminders.length > 3 && (
            <li className="text-sm font-medium">
              ... und {reminders.length - 3} weitere
            </li>
          )}
        </ul>
      </AlertDescription>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 rounded-full p-1 hover:bg-background/20 transition-colors"
        aria-label="Schließen"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}
