import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Bell, ClipboardList, Shield, Users, CheckCircle2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import heroBackground from "@/assets/hero-sunburst.png";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 min-h-[600px] flex items-center">
        {/* Hintergrundbild */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        
        {/* Text im Vordergrund */}
        <div className="container mx-auto relative z-10 text-center max-w-3xl">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Ihre Gesundheit,{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                immer im Blick
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Vorsorge, die mitdenkt. Intelligente Erinnerungen für Impfungen und U-Untersuchungen basierend auf RKI-Empfehlungen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Kostenlos registrieren
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Anmelden
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Alles für Ihre Gesundheitsvorsorge
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Behalten Sie den Überblick über alle wichtigen Termine und Dokumente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover-scale border-none shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">Impfkalender</CardTitle>
                <CardDescription>
                  Digitale Verwaltung aller Impftermine für die ganze Familie an einem Ort
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-scale border-none shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">Intelligente Erinnerungen</CardTitle>
                <CardDescription>
                  Automatische Benachrichtigungen für anstehende Impfungen und Untersuchungen
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-scale border-none shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">U-Untersuchungen</CardTitle>
                <CardDescription>
                  Vorsorgeuntersuchungen für Kinder automatisch berechnet basierend auf RKI-Standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-scale border-none shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">Meine Check-ups</CardTitle>
                <CardDescription>
                  Vorsorgeuntersuchungen basierend auf Ihrem Alter und Geschlecht automatisch empfohlen
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Warum VitaCare+?
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Die wichtigsten Vorteile Ihrer digitalen Gesundheitsvorsorge auf einen Blick.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-card p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ring-1 ring-[hsl(160,45%,75%)]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1.5">DSGVO-konform</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ihre sensiblen Gesundheitsdaten sind bei uns sicher und geschützt.
              </p>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ring-1 ring-[hsl(160,45%,75%)]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1.5">Familienkalender</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Verwalten Sie die Gesundheitsvorsorge der ganzen Familie zentral.
              </p>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ring-1 ring-[hsl(160,45%,75%)]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1.5">RKI-basiert</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Alle Empfehlungen folgen den offiziellen RKI-Richtlinien.
              </p>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ring-1 ring-[hsl(160,45%,75%)]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1.5">Export-Funktion</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Exportieren Sie Termine direkt in Ihren Kalender.
              </p>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ring-1 ring-[hsl(160,45%,75%)]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1.5">Keine Termine verpassen</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rechtzeitige Erinnerungen für jeden wichtigen Termin.
              </p>
            </div>

            <div className="bg-card p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ring-1 ring-[hsl(160,45%,75%)]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1.5">Übersichtlich</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Alle wichtigen Informationen auf einen Blick verfügbar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Bereit für bessere Gesundheitsvorsorge?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Starten Sie jetzt kostenlos und behalten Sie die Gesundheit Ihrer Familie immer im Blick
              </p>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Kostenlos registrieren
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
