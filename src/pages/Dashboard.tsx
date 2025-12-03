import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Syringe, Plus, LogOut, Calendar, FileText, User, Baby, Badge as BadgeIcon, Clock } from "lucide-react";
import vitacareLogo from "@/assets/vitacare-logo.png";
import { VaccinationList } from "@/components/VaccinationList";
import { AddVaccinationDialog } from "@/components/AddVaccinationDialog";
import { ProfileCard } from "@/components/ProfileCard";
import { ChildrenList } from "@/components/ChildrenList";
import { UExaminationsList } from "@/components/UExaminationsList";
import { AddChildDialog } from "@/components/AddChildDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReminderBanner } from "@/components/ReminderBanner";
import { VaccinationReminderBanner } from "@/components/VaccinationReminderBanner";
import { OverviewStatsCard } from "@/components/OverviewStatsCard";
import { getUpcomingExaminations, ReminderInfo, getUpcomingVaccinations, VaccinationReminderInfo, Vaccination } from "@/lib/reminderUtils";
import type { Database } from "@/integrations/supabase/types";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>();
  const [childrenRefreshTrigger, setChildrenRefreshTrigger] = useState(0);
  const [examinationsRefreshTrigger, setExaminationsRefreshTrigger] = useState(0);
  const [reminders, setReminders] = useState<ReminderInfo[]>([]);
  const [vaccinationReminders, setVaccinationReminders] = useState<VaccinationReminderInfo[]>([]);
  const [children, setChildren] = useState<Database['public']['Tables']['children']['Row'][]>([]);
  const [examinations, setExaminations] = useState<Database['public']['Tables']['u_examinations']['Row'][]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [vaccinationCount, setVaccinationCount] = useState(0);
  const [daysBeforeDue, setDaysBeforeDue] = useState(30);
  const [activeTab, setActiveTab] = useState("vaccinations");
  const [vaccinationsRefreshTrigger, setVaccinationsRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Lade Reminder-Einstellungen und Daten
  useEffect(() => {
    if (!user) return;

    const fetchReminderData = async () => {
      try {
        // Lade Reminder-Einstellungen
        const { data: prefs } = await supabase
          .from('reminder_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (prefs?.enabled) {
          setDaysBeforeDue(prefs.days_before_due || 30);

          // Lade Kinder
          const { data: childrenData } = await supabase
            .from('children')
            .select('*')
            .eq('user_id', user.id)
            .order('date_of_birth', { ascending: true });

          if (childrenData) {
            setChildren(childrenData);

            // Lade alle U-Untersuchungen für alle Kinder
            const { data: examsData } = await supabase
              .from('u_examinations')
              .select('*')
              .eq('user_id', user.id)
              .order('due_date', { ascending: true });

            if (examsData) {
              setExaminations(examsData);

              // Berechne Reminder
              const upcomingReminders = getUpcomingExaminations(
                examsData,
                childrenData,
                prefs.days_before_due || 30
              );
              setReminders(upcomingReminders);
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Reminder-Daten:', error);
      }
    };

    fetchReminderData();
  }, [user, childrenRefreshTrigger, examinationsRefreshTrigger]);

  // Lade Impfungen und berechne Impf-Reminder
  useEffect(() => {
    if (!user) return;

    const fetchVaccinationData = async () => {
      try {
        const { data: prefs } = await supabase
          .from('reminder_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Lade Impfungen
        const { data: vaccinationsData } = await supabase
          .from('vaccinations')
          .select('*')
          .eq('user_id', user.id)
          .order('vaccination_date', { ascending: false });

        if (vaccinationsData) {
          setVaccinations(vaccinationsData as Vaccination[]);
          setVaccinationCount(vaccinationsData.length);

          // Berechne Impf-Reminder wenn aktiviert
          if (prefs?.enabled) {
            const upcomingVaccinations = getUpcomingVaccinations(
              vaccinationsData as Vaccination[],
              prefs.days_before_due || 30
            );
            setVaccinationReminders(upcomingVaccinations);
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Impfdaten:', error);
      }
    };

    fetchVaccinationData();
  }, [user, vaccinationsRefreshTrigger]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Bis bald!",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Fehler beim Abmelden",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-secondary/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft overflow-hidden animate-scale-in">
                <img src={vitacareLogo} alt="Vita Care+ Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Vita Care+</h1>
                <p className="text-sm text-muted-foreground">Willkommen zurück!</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Reminder Banner */}
        {reminders.length > 0 && (
          <div className="mb-6">
            <ReminderBanner
              reminders={reminders}
              onDismiss={() => {}}
              onReminderClick={() => setActiveTab("children")}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="vaccinations" className="relative">
              <Syringe className="w-4 h-4 mr-2" />
              Impfungen
              {vaccinationReminders.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                >
                  {vaccinationReminders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="children" className="relative">
              <Baby className="w-4 h-4 mr-2" />
              U-Untersuchungen
              {reminders.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                >
                  {reminders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vaccinations" className="space-y-6">
            {/* Vaccination Reminder Banner */}
            {vaccinationReminders.length > 0 && (
              <VaccinationReminderBanner
                reminders={vaccinationReminders}
                onDismiss={() => {}}
                onReminderClick={() => {}}
              />
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Profile & Stats */}
              <div className="space-y-6">
                <ProfileCard userId={user?.id} />

                {/* Übersicht mit klickbaren Statistiken */}
                <OverviewStatsCard
                  type="vaccination"
                  vaccinations={vaccinations}
                  vaccinationReminders={vaccinationReminders}
                />
              </div>

              {/* Right Column - Vaccinations */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-soft border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Syringe className="w-5 h-5 text-primary" />
                          Meine Impfungen
                        </CardTitle>
                        <CardDescription>
                          Verwalten Sie Ihre Impfnachweise
                        </CardDescription>
                      </div>
                      <Button onClick={() => setShowAddDialog(true)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Hinzufügen
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <VaccinationList 
                      userId={user?.id} 
                      onVaccinationChange={() => setVaccinationsRefreshTrigger(prev => prev + 1)}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Children List & Stats */}
              <div className="space-y-6">
                <Card className="shadow-soft border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Baby className="w-5 h-5 text-primary" />
                      Kinder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ChildrenList 
                      onChildSelect={setSelectedChildId}
                      selectedChildId={selectedChildId}
                      refreshTrigger={childrenRefreshTrigger}
                    />
                    <AddChildDialog 
                      onChildAdded={() => {
                        setChildrenRefreshTrigger(prev => prev + 1);
                        setExaminationsRefreshTrigger(prev => prev + 1);
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Übersicht U-Untersuchungen */}
                <OverviewStatsCard
                  type="examination"
                  examinations={examinations}
                  children={children}
                />
              </div>

              {/* Right Column - U-Examinations */}
              <div className="lg:col-span-2">
                <UExaminationsList 
                  childId={selectedChildId}
                  childName={children.find(c => c.id === selectedChildId)?.first_name || ''}
                  refreshTrigger={examinationsRefreshTrigger}
                  onExaminationUpdated={() => setExaminationsRefreshTrigger(prev => prev + 1)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AddVaccinationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        userId={user?.id}
        onVaccinationAdded={() => setVaccinationsRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
};

export default Dashboard;
