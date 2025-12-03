import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, Loader2, Check, X, ImageIcon, Trash2 } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { de } from "date-fns/locale";

interface ScanVaccinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onVaccinationsAdded?: () => void;
}

interface ScannedVaccination {
  vaccine_name: string;
  vaccine_type: string;
  vaccination_date: string;
  batch_number?: string;
  doctor_name?: string;
  selected: boolean;
}

export const ScanVaccinationDialog = ({
  open,
  onOpenChange,
  userId,
  onVaccinationsAdded
}: ScanVaccinationDialogProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedVaccinations, setScannedVaccinations] = useState<ScannedVaccination[]>([]);
  const [notes, setNotes] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setImagePreview(null);
    setScannedVaccinations([]);
    setNotes(null);
    setIsAnalyzing(false);
    setIsSaving(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wählen Sie ein Bild aus (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Die maximale Dateigröße beträgt 10MB",
        variant: "destructive"
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setScannedVaccinations([]);
      setNotes(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setScannedVaccinations([]);
    setNotes(null);

    try {
      const { data, error } = await supabase.functions.invoke('scan-vaccination-record', {
        body: { imageBase64: imagePreview }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const vaccinations = (data.vaccinations || []).map((v: any) => ({
        ...v,
        selected: true
      }));

      setScannedVaccinations(vaccinations);
      setNotes(data.notes || null);

      if (vaccinations.length === 0) {
        toast({
          title: "Keine Impfungen erkannt",
          description: "Bitte versuchen Sie es mit einem besseren Foto oder fügen Sie die Impfungen manuell hinzu.",
          variant: "destructive"
        });
      } else {
        toast({
          title: `${vaccinations.length} Impfung(en) erkannt`,
          description: "Überprüfen Sie die Daten und wählen Sie die zu importierenden Einträge."
        });
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: "Analyse fehlgeschlagen",
        description: error.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleVaccination = (index: number) => {
    setScannedVaccinations(prev => 
      prev.map((v, i) => i === index ? { ...v, selected: !v.selected } : v)
    );
  };

  const updateVaccination = (index: number, field: keyof ScannedVaccination, value: string) => {
    setScannedVaccinations(prev =>
      prev.map((v, i) => i === index ? { ...v, [field]: value } : v)
    );
  };

  const saveSelectedVaccinations = async () => {
    const selectedVaccinations = scannedVaccinations.filter(v => v.selected);
    
    if (selectedVaccinations.length === 0) {
      toast({
        title: "Keine Auswahl",
        description: "Bitte wählen Sie mindestens eine Impfung zum Importieren aus.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const vaccinationsToInsert = selectedVaccinations.map(v => ({
        user_id: userId,
        vaccine_name: v.vaccine_name,
        vaccine_type: v.vaccine_type,
        vaccination_date: v.vaccination_date,
        batch_number: v.batch_number || null,
        doctor_name: v.doctor_name || null
      }));

      const { error } = await supabase
        .from('vaccinations')
        .insert(vaccinationsToInsert);

      if (error) throw error;

      toast({
        title: "Erfolgreich importiert",
        description: `${selectedVaccinations.length} Impfung(en) wurden hinzugefügt.`
      });

      onVaccinationsAdded?.();
      onOpenChange(false);
      resetState();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Die Impfungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'dd.MM.yyyy', { locale: de });
      }
    } catch {
      // Ignore formatting errors
    }
    return dateString;
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetState();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Impfpass scannen
          </DialogTitle>
          <DialogDescription>
            Laden Sie ein Foto Ihres Impfpasses hoch. Die KI erkennt automatisch alle Impfungen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          {!imagePreview && (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Foto hochladen</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Klicken oder Bild hierher ziehen
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Datei auswählen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Impfpass Vorschau"
                  className="w-full max-h-64 object-contain rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={resetState}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {scannedVaccinations.length === 0 && !isAnalyzing && (
                <Button 
                  onClick={analyzeImage} 
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Impfungen erkennen
                </Button>
              )}
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analysiere Impfpass...</p>
            </div>
          )}

          {/* Notes from AI */}
          {notes && (
            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              {notes}
            </div>
          )}

          {/* Scanned Vaccinations List */}
          {scannedVaccinations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">
                Erkannte Impfungen ({scannedVaccinations.filter(v => v.selected).length} ausgewählt)
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {scannedVaccinations.map((vaccination, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 transition-colors ${
                      vaccination.selected ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={vaccination.selected}
                        onCheckedChange={() => toggleVaccination(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">Impfstoff</label>
                            <Input
                              value={vaccination.vaccine_name}
                              onChange={(e) => updateVaccination(index, 'vaccine_name', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Art</label>
                            <Input
                              value={vaccination.vaccine_type}
                              onChange={(e) => updateVaccination(index, 'vaccine_type', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">Datum</label>
                            <Input
                              value={formatDateForDisplay(vaccination.vaccination_date)}
                              onChange={(e) => {
                                // Try to parse the date and convert to YYYY-MM-DD
                                const inputValue = e.target.value;
                                try {
                                  const parsed = parse(inputValue, 'dd.MM.yyyy', new Date());
                                  if (isValid(parsed)) {
                                    updateVaccination(index, 'vaccination_date', format(parsed, 'yyyy-MM-dd'));
                                  }
                                } catch {
                                  // Keep the original value for manual editing
                                }
                              }}
                              className="h-8 text-sm"
                              placeholder="TT.MM.JJJJ"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Charge</label>
                            <Input
                              value={vaccination.batch_number || ''}
                              onChange={(e) => updateVaccination(index, 'batch_number', e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Arzt</label>
                            <Input
                              value={vaccination.doctor_name || ''}
                              onChange={(e) => updateVaccination(index, 'doctor_name', e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={saveSelectedVaccinations}
                  disabled={isSaving || scannedVaccinations.filter(v => v.selected).length === 0}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {scannedVaccinations.filter(v => v.selected).length} Impfung(en) importieren
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
