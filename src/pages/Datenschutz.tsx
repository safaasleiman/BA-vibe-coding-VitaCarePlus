import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Server, Eye, Trash2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import vitacareLogo from "@/assets/vitacare-logo.png";

const Datenschutz = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft overflow-hidden">
                <img src={vitacareLogo} alt="Vita Care+ Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Vita Care+</h1>
                <p className="text-sm text-muted-foreground">Datenschutzerklärung</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-xl shadow-soft border border-border/50 p-8 space-y-8">
          
          {/* Header Section */}
          <div className="text-center pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Datenschutzerklärung</h1>
            <p className="text-muted-foreground">
              Ihre Daten sind uns wichtig. Hier erfahren Sie, wie wir sie schützen.
            </p>
            <p className="text-sm text-muted-foreground mt-2">Stand: Dezember 2024</p>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">1. Verantwortlicher</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground">
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der 
                Datenschutz-Grundverordnung (DSGVO) ist:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-foreground">[Ihr Name / Firmenname]</p>
                <p>[Straße und Hausnummer]</p>
                <p>[PLZ und Ort]</p>
                <p>E-Mail: [ihre@email.de]</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">2. Welche Daten werden erhoben?</h2>
            </div>
            <div className="pl-13 space-y-4 text-muted-foreground">
              <p>Wir erheben und verarbeiten folgende personenbezogene Daten:</p>
              
              <div className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Kontodaten</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>E-Mail-Adresse (für Anmeldung und Kommunikation)</li>
                    <li>Name (optional, für personalisierte Anzeige)</li>
                  </ul>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Gesundheitsdaten</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Impfungen (Name, Datum, Arzt, Chargennummer)</li>
                    <li>U-Untersuchungen (Typ, Datum, Arzt)</li>
                    <li>Kinderdaten (Name, Geburtsdatum)</li>
                    <li>Notizen und Bemerkungen</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Besonderer Schutz für sensible Daten
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  Notizen und andere sensible Felder werden zusätzlich <strong>client-seitig verschlüsselt</strong>, 
                  bevor sie in der Datenbank gespeichert werden. Nur Sie können diese Daten entschlüsseln.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">3. Wie werden Ihre Daten geschützt?</h2>
            </div>
            <div className="pl-13 space-y-4 text-muted-foreground">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">🔐 Verschlüsselung</h3>
                  <p className="text-sm">
                    Alle Datenübertragungen erfolgen über HTTPS (TLS 1.3). 
                    Sensible Felder werden zusätzlich mit AES-256-GCM verschlüsselt.
                  </p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">🛡️ Zugriffskontrolle</h3>
                  <p className="text-sm">
                    Row Level Security (RLS) stellt sicher, dass Sie nur Ihre eigenen 
                    Daten sehen und bearbeiten können.
                  </p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">🇪🇺 EU-Hosting</h3>
                  <p className="text-sm">
                    Ihre Daten werden auf Servern in der Europäischen Union 
                    gespeichert und unterliegen der DSGVO.
                  </p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">🔑 Sichere Authentifizierung</h3>
                  <p className="text-sm">
                    Passwörter werden mit bcrypt gehasht und niemals im Klartext gespeichert.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">4. Ihre Rechte</h2>
            </div>
            <div className="pl-13 space-y-4 text-muted-foreground">
              <p>Nach der DSGVO haben Sie folgende Rechte:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Auskunftsrecht:</strong> Sie können jederzeit Auskunft über Ihre gespeicherten Daten verlangen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Berichtigungsrecht:</strong> Sie können die Korrektur unrichtiger Daten verlangen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer Daten verlangen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Datenübertragbarkeit:</strong> Sie können Ihre Daten in einem gängigen Format erhalten.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span><strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">5. Datenlöschung</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground">
              <p>
                Ihre Daten werden gelöscht, sobald sie für den Zweck ihrer Erhebung nicht mehr erforderlich sind 
                oder Sie Ihr Konto löschen. Bei Kontolöschung werden alle zugehörigen Daten 
                (Impfungen, U-Untersuchungen, Kinderdaten) unwiderruflich entfernt.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">6. Kontakt</h2>
            </div>
            <div className="pl-13 space-y-2 text-muted-foreground">
              <p>
                Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte können Sie uns jederzeit kontaktieren:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p>E-Mail: <a href="mailto:[ihre@email.de]" className="text-primary hover:underline">[ihre@email.de]</a></p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>Diese Datenschutzerklärung wurde zuletzt aktualisiert am: Dezember 2024</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Datenschutz;
