import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Syringe, Plus, LogOut, Calendar, FileText, User, Baby, Badge as BadgeIcon, Clock, Camera, Stethoscope } from "lucide-react";
import vitacareLogo from "@/assets/vitacare-logo.png";
import { VaccinationList } from "@/components/VaccinationList";
import { AddVaccinationDialog } from "@/components/AddVaccinationDialog";
import { ScanVaccinationDialog } from "@/components/ScanVaccinationDialog";
import { ProfileCard } from "@/components/ProfileCard";
import { ChildrenList } from "@/components/ChildrenList";
import { UExaminationsList } from "@/components/UExaminationsList";
import { CheckUpsList } from "@/components/CheckUpsList";
import { AddChildDialog } from "@/components/AddChildDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReminderBanner } from "@/components/ReminderBanner";
import { VaccinationReminderBanner } from "@/components/VaccinationReminderBanner";
import { CombinedOverviewCard } from "@/components/CombinedOverviewCard";
import { OverviewStatsCard } from "@/components/OverviewStatsCard";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { getUpcomingExaminations, ReminderInfo, getUpcomingVaccinations, VaccinationReminderInfo, Vaccination } from "@/lib/reminderUtils";
import type { Database } from "@/integrations/supabase/types";

interface Profile {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>();
  const [childrenRefreshTrigger, setChildrenRefreshTrigger] = useState(0);
  const [examinationsRefreshTrigger, setExaminationsRefreshTrigger] = useState(0);
  const [checkUpsRefreshTrigger, setCheckUpsRefreshTrigger] = useState(0);
  const [reminders, setReminders] = useState<ReminderInfo[]>([]);
  const [vaccinationReminders, setVaccinationReminders] = useState<VaccinationReminderInfo[]>([]);
  const [children, setChildren] = useState<Database['public']['Tables']['children']['Row'][]>([]);
  const [examinations, setExaminations] = useState<Database['public']['Tables']['u_examinations']['Row'][]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [vaccinationCount, setVaccinationCount] = useState(0);
  const [daysBeforeDue, setDaysBeforeDue] = useState(30);
  const [activeTab, setActiveTab] = useState("vaccinations");
  const [vaccinationsRefreshTrigger, setVaccinationsRefreshTrigger] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all");
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

  // Load profile data
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

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

  // Filter vaccinations based on selected filter
  const filteredVaccinations = vaccinations.filter(v => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "self") return !v.child_id;
    return v.child_id === selectedFilter;
  });

  // Filter vaccination reminders
  const filteredVaccinationReminders = vaccinationReminders.filter(r => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "self") return !r.vaccination.child_id;
    return r.vaccination.child_id === selectedFilter;
  });

  // Filter examinations based on selected filter (only for children)
  const filteredExaminations = examinations.filter(e => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "self") return false; // U-exams are only for children
    return e.child_id === selectedFilter;
  });

  // Filter examination reminders
  const filteredReminders = reminders.filter(r => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "self") return false;
    return r.child.id === selectedFilter;
  });

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
            <div className="flex items-center gap-2">
              <PushNotificationToggle />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Kombinierte Terminübersicht */}
        <div className="mb-6">
          <CombinedOverviewCard
            vaccinations={vaccinations}
            vaccinationReminders={vaccinationReminders}
            examinations={examinations}
            children={children}
          />
        </div>

        {/* Reminder Banner */}
        {filteredReminders.length > 0 && (
          <div className="mb-6">
            <ReminderBanner
              reminders={filteredReminders}
              onDismiss={() => {}}
              onReminderClick={() => setActiveTab("children")}
            />
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Filter */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <DashboardSidebar
                children={children}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                userName={profile?.full_name || "Mich"}
              />
              
              {/* Profile Card */}
              <ProfileCard userId={user?.id} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
                <TabsTrigger value="vaccinations" className="relative">
                  <Syringe className="w-4 h-4 mr-2" />
                  Impfungen
                  {filteredVaccinationReminders.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                    >
                      {filteredVaccinationReminders.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="children" className="relative">
                  <Baby className="w-4 h-4 mr-2" />
                  U-Untersuchungen
                  {filteredReminders.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                    >
                      {filteredReminders.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="checkups" className="relative">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Check-ups
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vaccinations" className="space-y-6">
                {/* Vaccination Reminder Banner */}
                {filteredVaccinationReminders.length > 0 && (
                  <VaccinationReminderBanner
                    reminders={filteredVaccinationReminders}
                    onDismiss={() => {}}
                    onReminderClick={() => {}}
                  />
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Left Column - Stats (mobile only shows inline) */}
                  <div className="space-y-6 lg:hidden">
                    <OverviewStatsCard
                      type="vaccination"
                      vaccinations={filteredVaccinations}
                      vaccinationReminders={filteredVaccinationReminders}
                    />
                  </div>

                  {/* Stats for desktop - hidden on mobile */}
                  <div className="hidden lg:block space-y-6">
                    <OverviewStatsCard
                      type="vaccination"
                      vaccinations={filteredVaccinations}
                      vaccinationReminders={filteredVaccinationReminders}
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
                              {selectedFilter === "all" 
                                ? "Alle Impfungen" 
                                : selectedFilter === "self" 
                                  ? "Meine Impfungen"
                                  : `Impfungen: ${children.find(c => c.id === selectedFilter)?.first_name || ''}`
                              }
                            </CardTitle>
                            <CardDescription>
                              Verwalten Sie Ihre Impfnachweise
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => setShowScanDialog(true)} variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" />
                              Scannen
                            </Button>
                            <Button onClick={() => setShowAddDialog(true)} size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Hinzufügen
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <VaccinationList 
                          userId={user?.id}
                          children={children}
                          filterChildId={selectedFilter === "all" ? undefined : selectedFilter === "self" ? "self" : selectedFilter}
                          onVaccinationChange={() => setVaccinationsRefreshTrigger(prev => prev + 1)}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="children" className="space-y-6">
                {selectedFilter === "self" ? (
                  <Card className="shadow-soft border-border/50">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Baby className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>U-Untersuchungen sind nur für Kinder verfügbar.</p>
                      <p className="text-sm mt-1">
                        Wählen Sie im Filter ein Kind aus oder "Alle anzeigen".
                      </p>
                    </CardContent>
                  </Card>
                ) : (
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
                            onChildSelect={(id) => {
                              setSelectedChildId(id);
                              setSelectedFilter(id || "all");
                            }}
                            selectedChildId={selectedFilter !== "all" && selectedFilter !== "self" ? selectedFilter : selectedChildId}
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
                        examinations={filteredExaminations}
                        children={children}
                      />
                    </div>

                    {/* Right Column - U-Examinations */}
                    <div className="lg:col-span-2">
                      <UExaminationsList 
                        childId={selectedFilter !== "all" && selectedFilter !== "self" ? selectedFilter : selectedChildId}
                        childName={children.find(c => c.id === (selectedFilter !== "all" && selectedFilter !== "self" ? selectedFilter : selectedChildId))?.first_name || ''}
                        refreshTrigger={examinationsRefreshTrigger}
                        onExaminationUpdated={() => setExaminationsRefreshTrigger(prev => prev + 1)}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="checkups" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Left Column - Profile Info */}
                  <div className="space-y-6">
                    <Card className="shadow-soft border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          Ihr Profil
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Geschlecht:</span>{" "}
                          <span className="font-medium">
                            {profile?.gender === 'female' ? 'Weiblich' : 
                             profile?.gender === 'male' ? 'Männlich' : 
                             profile?.gender === 'diverse' ? 'Divers' : 
                             'Nicht angegeben'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Geburtsdatum:</span>{" "}
                          <span className="font-medium">
                            {profile?.date_of_birth || 'Nicht angegeben'}
                          </span>
                        </div>
                        {(!profile?.gender || !profile?.date_of_birth) && (
                          <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            Bitte vervollständigen Sie Ihr Profil für personalisierte Check-up-Empfehlungen.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Check-ups */}
                  <div className="lg:col-span-2">
                    <CheckUpsList
                      userId={user?.id}
                      dateOfBirth={profile?.date_of_birth || null}
                      gender={profile?.gender || null}
                      refreshTrigger={checkUpsRefreshTrigger}
                      onCheckUpUpdated={() => setCheckUpsRefreshTrigger(prev => prev + 1)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <AddVaccinationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        userId={user?.id}
        children={children}
        onVaccinationAdded={() => setVaccinationsRefreshTrigger(prev => prev + 1)}
      />

      <ScanVaccinationDialog
        open={showScanDialog}
        onOpenChange={setShowScanDialog}
        userId={user?.id}
        onVaccinationsAdded={() => setVaccinationsRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
};

export default Dashboard;
