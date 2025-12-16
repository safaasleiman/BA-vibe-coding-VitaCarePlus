import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import vitacareAuthLogo from "@/assets/vitacare-auth-logo.png";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) {
      toast({
        title: "Geschlecht auswählen",
        description: "Bitte wählen Sie Ihr Geschlecht für personalisierte Vorsorgeempfehlungen.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            gender: gender,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Willkommen bei Vita Care+!",
        description: "Sie wurden automatisch eingeloggt.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler bei der Registrierung",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Anmeldung erfolgreich!",
        description: "Willkommen zurück.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler bei der Anmeldung",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-auth p-4">
      <div className="w-full max-w-[440px]">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 animate-scale-in">
            <img src={vitacareAuthLogo} alt="Vita Care+ Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            {activeTab === "signin" ? "Anmelden bei VitaCare+" : "Registrieren bei VitaCare+"}
          </h1>
          <p className="text-muted-foreground text-base">
            Vorsorge, die mitdenkt – sicher und DSGVO-konform.
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-form border-0 rounded-2xl">
          <CardContent className="p-6 md:p-8">
            {/* Segment Control Tabs */}
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "signin"
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Anmelden
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "signup"
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Registrieren
              </button>
            </div>

            {/* Sign In Form */}
            {activeTab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium">E-Mail</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="ihre.email@beispiel.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-medium">Passwort</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl font-medium text-base shadow-sm hover:shadow-md transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? "Wird angemeldet..." : "Anmelden"}
                </Button>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Vollständiger Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Max Mustermann"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">E-Mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="ihre.email@beispiel.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Passwort</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-gender" className="text-sm font-medium">Geschlecht *</Label>
                  <Select value={gender} onValueChange={setGender} disabled={loading}>
                    <SelectTrigger className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-primary/20">
                      <SelectValue placeholder="Geschlecht auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Weiblich</SelectItem>
                      <SelectItem value="male">Männlich</SelectItem>
                      <SelectItem value="diverse">Divers</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Für personalisierte Vorsorge-Empfehlungen
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl font-medium text-base shadow-sm hover:shadow-md transition-all duration-200" 
                  disabled={loading || !gender}
                >
                  {loading ? "Wird registriert..." : "Kostenlos registrieren"}
                </Button>
              </form>
            )}

            {/* Privacy Notice */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Mit Ihrer Anmeldung akzeptieren Sie unsere{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
