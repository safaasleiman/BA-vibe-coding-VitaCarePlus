import { Link } from "react-router-dom";
import { Calendar, Bell, ClipboardList, Shield, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-vitacare.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Ihre Gesundheit, immer im Blick
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Vorsorge, die mitdenkt. Intelligente Erinnerungen für Impfungen und U-Untersuchungen basierend auf RKI-Empfehlungen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    Kostenlos registrieren
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Anmelden
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <img
                src={heroImage}
                alt="Vita Care+ Gesundheits-App"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
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

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-scale">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Impfkalender</CardTitle>
                <CardDescription>
                  Digitale Verwaltung aller Impftermine für die ganze Familie an einem Ort
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-scale">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Intelligente Erinnerungen</CardTitle>
                <CardDescription>
                  Automatische Benachrichtigungen für anstehende Impfungen und Untersuchungen
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-scale">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Vorsorgeplan</CardTitle>
                <CardDescription>
                  U-Untersuchungen für Kinder automatisch berechnet basierend auf RKI-Standards
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Warum Vita Care+?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border hover-scale">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">DSGVO-konform</h3>
                <p className="text-sm text-muted-foreground">
                  Ihre sensiblen Gesundheitsdaten sind bei uns sicher und geschützt
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border hover-scale">
              <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Familienkalender</h3>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie die Gesundheitsvorsorge der ganzen Familie zentral
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border hover-scale">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">RKI-basiert</h3>
                <p className="text-sm text-muted-foreground">
                  Alle Empfehlungen folgen den offiziellen RKI-Richtlinien
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border hover-scale">
              <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Export-Funktion</h3>
                <p className="text-sm text-muted-foreground">
                  Exportieren Sie Termine direkt in Ihren Kalender
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border hover-scale">
              <Bell className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Keine Termine verpassen</h3>
                <p className="text-sm text-muted-foreground">
                  Rechtzeitige Erinnerungen damit Sie jeden Termin wahrnehmen können
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border hover-scale">
              <ClipboardList className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Übersichtlich</h3>
                <p className="text-sm text-muted-foreground">
                  Alle wichtigen Informationen auf einen Blick verfügbar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Bereit für bessere Gesundheitsvorsorge?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Starten Sie jetzt kostenlos und behalten Sie die Gesundheit Ihrer Familie immer im Blick
              </p>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
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
