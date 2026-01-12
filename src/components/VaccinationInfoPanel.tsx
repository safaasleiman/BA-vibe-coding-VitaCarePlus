import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Users, Calendar, RefreshCw, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VaccinationInfo {
  protection: string;
  recommendedFor: string;
  schedule: string;
  booster: string;
  notes: string;
}

interface VaccinationInfoPanelProps {
  vaccinationName: string;
  isVisible: boolean;
}

export const VaccinationInfoPanel = ({ vaccinationName, isVisible }: VaccinationInfoPanelProps) => {
  const [info, setInfo] = useState<VaccinationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible && vaccinationName && vaccinationName !== "sonstige") {
      fetchVaccinationInfo();
    } else {
      setInfo(null);
      setError(null);
    }
  }, [vaccinationName, isVisible]);

  const fetchVaccinationInfo = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("vaccination-info", {
        body: { vaccinationName },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        if (data.error.includes("429") || data.error.includes("Zu viele Anfragen")) {
          toast({
            title: "Zu viele Anfragen",
            description: "Bitte warten Sie einen Moment und versuchen Sie es erneut.",
            variant: "destructive",
          });
        } else if (data.error.includes("402") || data.error.includes("Nutzungslimit")) {
          toast({
            title: "Nutzungslimit erreicht",
            description: "Bitte laden Sie Credits auf, um fortzufahren.",
            variant: "destructive",
          });
        }
        throw new Error(data.error);
      }

      if (data?.info) {
        setInfo(data.info);
      } else if (data?.rawContent) {
        // Fallback for raw content
        setInfo({
          protection: data.rawContent,
          recommendedFor: "",
          schedule: "",
          booster: "",
          notes: "",
        });
      }
    } catch (err) {
      console.error("Error fetching vaccination info:", err);
      setError("Informationen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || vaccinationName === "sonstige" || !vaccinationName) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border bg-accent/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Info className="h-4 w-4" />
          Informationen zur Impfung
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Lade Informationen...
              </span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <AlertCircle className="h-5 w-5 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fetchVaccinationInfo}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Erneut versuchen
              </Button>
            </div>
          )}

          {info && !loading && (
            <div className="space-y-3 text-sm">
              {info.protection && (
                <InfoItem
                  icon={<Shield className="h-4 w-4 text-green-600" />}
                  title="Schutz vor"
                  content={info.protection}
                />
              )}
              {info.recommendedFor && (
                <InfoItem
                  icon={<Users className="h-4 w-4 text-blue-600" />}
                  title="Empfohlen für"
                  content={info.recommendedFor}
                />
              )}
              {info.schedule && (
                <InfoItem
                  icon={<Calendar className="h-4 w-4 text-purple-600" />}
                  title="Impfschema"
                  content={info.schedule}
                />
              )}
              {info.booster && (
                <InfoItem
                  icon={<RefreshCw className="h-4 w-4 text-orange-600" />}
                  title="Auffrischung"
                  content={info.booster}
                />
              )}
              {info.notes && (
                <InfoItem
                  icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
                  title="Hinweise"
                  content={info.notes}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const InfoItem = ({ icon, title, content }: InfoItemProps) => (
  <div className="flex gap-3">
    <div className="mt-0.5 shrink-0">{icon}</div>
    <div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-muted-foreground leading-relaxed">{content}</p>
    </div>
  </div>
);
