import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleClick = () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isSubscribed ? "default" : "outline"}
            size="sm"
            onClick={handleClick}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isSubscribed ? "Push aktiv" : "Push aktivieren"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSubscribed 
            ? "Push-Benachrichtigungen sind aktiviert. Klicken zum Deaktivieren."
            : permission === 'denied'
              ? "Benachrichtigungen wurden blockiert. Bitte in den Browsereinstellungen erlauben."
              : "Push-Benachrichtigungen für fällige Termine aktivieren"
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
