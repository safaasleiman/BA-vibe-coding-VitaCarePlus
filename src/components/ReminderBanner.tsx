import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Clock, Info } from "lucide-react";
import { ReminderInfo, formatReminderMessage, getReminderSummary } from "@/lib/reminderUtils";
import { useState, useEffect } from "react";

interface ReminderBannerProps {
  reminders: ReminderInfo[];
  onDismiss: () => void;
  onReminderClick: () => void;
}

export function ReminderBanner({ reminders, onDismiss, onReminderClick }: ReminderBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const summary = getReminderSummary(reminders);

  // Prüfe ob Banner für diese Session bereits geschlossen wurde
  useEffect(() => {
    const dismissedKey = 'reminder-banner-dismissed';
    const dismissedTime = sessionStorage.getItem(dismissedKey);
    
    if (dismissedTime) {
      const lastDismissed = new Date(dismissedTime);
      const now = new Date();
      const hoursSinceDismissed = (now.getTime() - lastDismissed.getTime()) / (1000 * 60 * 60);
      
      // Zeige Banner wieder nach 1 Stunde
      if (hoursSinceDismissed < 1) {
        setIsVisible(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('reminder-banner-dismissed', new Date().toISOString());
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible || reminders.length === 0) {
    return null;
  }

  // Bestimme Variante und Icon basierend auf höchster Dringlichkeit
  let variant: "default" | "destructive" = "default";
  let Icon = Info;
  let title = "";
  let bgClass = "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900";

  if (summary.overdueCount > 0) {
    variant = "destructive";
    Icon = AlertTriangle;
    title = `${summary.overdueCount} U-Untersuchung${summary.overdueCount === 1 ? '' : 'en'} überfällig!`;
    bgClass = "bg-destructive/10 border-destructive/50";
  } else if (summary.urgentCount > 0) {
    Icon = Clock;
    title = `${summary.urgentCount} U-Untersuchung${summary.urgentCount === 1 ? '' : 'en'} in den nächsten 7 Tagen fällig`;
    bgClass = "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900";
  } else {
    title = `${summary.upcomingCount} U-Untersuchung${summary.upcomingCount === 1 ? '' : 'en'} in den nächsten 30 Tagen fällig`;
  }

  return (
    <Alert 
      variant={variant} 
      className={`relative cursor-pointer transition-all hover:shadow-md ${bgClass}`}
      onClick={onReminderClick}
    >
      <Icon className="h-5 w-5" />
      <AlertTitle className="flex items-center justify-between pr-8">
        {title}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="space-y-1 mt-2">
        {reminders.slice(0, 3).map((reminder) => (
          <div key={reminder.examination.id} className="text-sm">
            • {formatReminderMessage(reminder)}
          </div>
        ))}
        {reminders.length > 3 && (
          <div className="text-sm font-medium mt-2">
            ... und {reminders.length - 3} weitere
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
