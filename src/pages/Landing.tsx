import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Bell, ClipboardList, Shield, Users, CheckCircle2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import heroIllustration from "@/assets/hero-illustration.png";

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

      {/* Hero Section - Split Layout */}
      <section className="relative overflow-hidden pt-24 md:pt-32 pb-12 md:pb-20 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text links */}
            <div className="space-y-4 md:space-y-6 animate-fade-in text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Ihre Gesundheit,{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  immer im Blick
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Vorsorge, die mitdenkt. Intelligente Erinnerungen für Impfungen und U-Untersuchungen basierend auf RKI-Empfehlungen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 justify-center lg:justify-start">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg">
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
            
            {/* Illustration rechts mit Sunburst */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2 animate-fade-in">
              <div className="relative">
                {/* Sunburst Hintergrund */}
                <div 
                  className="absolute inset-0 -inset-x-16 -inset-y-16 opacity-60"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%, 
                      hsl(170 40% 85%) 0deg, 
                      hsl(170 50% 92%) 10deg, 
                      hsl(170 40% 85%) 20deg, 
                      hsl(170 50% 92%) 30deg, 
                      hsl(170 40% 85%) 40deg, 
                      hsl(170 50% 92%) 50deg, 
                      hsl(170 40% 85%) 60deg, 
                      hsl(170 50% 92%) 70deg, 
                      hsl(170 40% 85%) 80deg, 
                      hsl(170 50% 92%) 90deg,
                      hsl(170 40% 85%) 100deg, 
                      hsl(170 50% 92%) 110deg, 
                      hsl(170 40% 85%) 120deg, 
                      hsl(170 50% 92%) 130deg, 
                      hsl(170 40% 85%) 140deg, 
                      hsl(170 50% 92%) 150deg, 
                      hsl(170 40% 85%) 160deg, 
                      hsl(170 50% 92%) 170deg,
                      hsl(170 40% 85%) 180deg, 
                      hsl(170 50% 92%) 190deg, 
                      hsl(170 40% 85%) 200deg, 
                      hsl(170 50% 92%) 210deg, 
                      hsl(170 40% 85%) 220deg, 
                      hsl(170 50% 92%) 230deg, 
                      hsl(170 40% 85%) 240deg, 
                      hsl(170 50% 92%) 250deg,
                      hsl(170 40% 85%) 260deg, 
                      hsl(170 50% 92%) 270deg, 
                      hsl(170 40% 85%) 280deg, 
                      hsl(170 50% 92%) 290deg, 
                      hsl(170 40% 85%) 300deg, 
                      hsl(170 50% 92%) 310deg, 
                      hsl(170 40% 85%) 320deg, 
                      hsl(170 50% 92%) 330deg,
                      hsl(170 40% 85%) 340deg, 
                      hsl(170 50% 92%) 350deg, 
                      hsl(170 40% 85%) 360deg
                    )`,
                    borderRadius: '50%',
                    transform: 'scale(1.5)',
                  }}
                />
                <img 
                  src={heroIllustration} 
                  alt="VitaCare+ Familie Gesundheitsvorsorge" 
                  className="relative z-10 w-[200px] sm:w-[280px] md:w-[350px] lg:w-[420px] h-auto drop-shadow-xl"
                />
              </div>
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
