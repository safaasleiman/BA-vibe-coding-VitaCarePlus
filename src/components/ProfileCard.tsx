import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileCardProps {
  userId: string;
  onProfileUpdated?: () => void;
}

interface Profile {
  full_name: string | null;
  date_of_birth: string | null;
  location: string | null;
  gender: string | null;
}

export const ProfileCard = ({ userId, onProfileUpdated }: ProfileCardProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Profile>({
    full_name: "",
    date_of_birth: "",
    location: "",
    gender: "",
  });
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setFormData(data);
      }
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          ...formData,
        });

      if (error) throw error;

      setProfile(formData);
      setEditing(false);
      toast({
        title: "Profil aktualisiert",
        description: "Ihre Änderungen wurden gespeichert.",
      });
      onProfileUpdated?.();
    } catch (error: any) {
      toast({
        title: "Fehler beim Speichern",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || { full_name: "", date_of_birth: "", location: "", gender: "" });
    setEditing(false);
  };

  if (loading && !profile) {
    return (
      <Card className="shadow-soft border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Mein Profil
          </CardTitle>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleSave} disabled={loading}>
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={loading}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Name</Label>
          {editing ? (
            <Input
              id="full_name"
              value={formData.full_name || ""}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={loading}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {profile?.full_name || "Nicht angegeben"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Geburtsdatum</Label>
          {editing ? (
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth || ""}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              disabled={loading}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {profile?.date_of_birth || "Nicht angegeben"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Geschlecht</Label>
          {editing ? (
            <Select
              value={formData.gender || ""}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Geschlecht auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Weiblich</SelectItem>
                <SelectItem value="male">Männlich</SelectItem>
                <SelectItem value="diverse">Divers</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              {profile?.gender === 'female' ? 'Weiblich' : 
               profile?.gender === 'male' ? 'Männlich' : 
               profile?.gender === 'diverse' ? 'Divers' : 
               'Nicht angegeben'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Wohnort</Label>
          {editing ? (
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={loading}
              placeholder="Stadt, Land"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {profile?.location || "Nicht angegeben"}
            </p>
          )}
        </div>

        {!editing && (!profile?.gender || !profile?.date_of_birth) && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
            Bitte vervollständigen Sie Ihr Profil für personalisierte Check-up-Empfehlungen.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
