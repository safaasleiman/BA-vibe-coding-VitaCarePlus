import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Syringe, Plus, LogOut, Calendar, FileText, User, Baby, Badge as BadgeIcon, Clock, Camera, Stethoscope, Filter } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-soft overflow-hidden animate-scale-in">
                <img src={vitacareLogo} alt="Vita Care+ Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Vita Care+</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Willkommen zurück!</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <PushNotificationToggle />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Abmelden</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="sm:hidden">
                    <p>Abmelden</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">

        {/* Mobile Filter Dropdown */}
        <div className="lg:hidden mb-4">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full h-11 bg-card">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Filter wählen" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              <SelectItem value="all">Alle anzeigen</SelectItem>
              <SelectItem value="self">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {profile?.full_name || "Für mich"}
                </span>
              </SelectItem>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  <span className="flex items-center gap-2">
                    <Baby className="w-4 h-4" />
                    {child.first_name} {child.last_name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reminder Banner */}
        {filteredReminders.length > 0 && (
          <div className="mb-4 sm:mb-6">
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
              <ProfileCard 
                userId={user?.id} 
                onProfileUpdated={() => {
                  // Refresh profile data
                  supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user?.id)
                    .maybeSingle()
                    .then(({ data }) => {
                      if (data) setProfile(data);
                    });
                  setCheckUpsRefreshTrigger(prev => prev + 1);
                }}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto h-11 sm:h-10">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="overview" 
                        className={`relative transition-all duration-300 h-10 px-2 sm:px-3 ${
                          activeTab === "overview" 
                            ? "bg-emerald-100 dark:bg-emerald-900/30 data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30" 
                            : "opacity-50"
                        }`}
                      >
                        <Calendar className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Übersicht</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="sm:hidden">
                      <p>Übersicht</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="vaccinations" 
                        className={`relative transition-all duration-300 h-10 px-2 sm:px-3 ${
                          activeTab === "vaccinations" 
                            ? "bg-emerald-100 dark:bg-emerald-900/30 data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30" 
                            : "opacity-50"
                        }`}
                      >
                        <Syringe className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Impfungen</span>
                        {filteredVaccinationReminders.length > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-1 sm:ml-2 h-5 min-w-5 px-1 sm:px-1.5 text-xs"
                          >
                            {filteredVaccinationReminders.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="sm:hidden">
                      <p>Impfungen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="children" 
                        className={`relative transition-all duration-300 h-10 px-2 sm:px-3 ${
                          activeTab === "children" 
                            ? "bg-emerald-100 dark:bg-emerald-900/30 data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30" 
                            : "opacity-50"
                        }`}
                      >
                        <Baby className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">U-Untersuchungen</span>
                        {filteredReminders.length > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-1 sm:ml-2 h-5 min-w-5 px-1 sm:px-1.5 text-xs"
                          >
                            {filteredReminders.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="sm:hidden">
                      <p>U-Untersuchungen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="checkups" 
                        className={`relative transition-all duration-300 h-10 px-2 sm:px-3 ${
                          activeTab === "checkups" 
                            ? "bg-emerald-100 dark:bg-emerald-900/30 data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30" 
                            : "opacity-50"
                        }`}
                      >
                        <Stethoscope className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Check-ups</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="sm:hidden">
                      <p>Check-ups</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <CombinedOverviewCard
                  vaccinations={vaccinations}
                  vaccinationReminders={vaccinationReminders}
                  examinations={examinations}
                  children={children}
                />
              </TabsContent>

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
                      <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                              <Syringe className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                              <span className="truncate">
                                {selectedFilter === "all" 
                                  ? "Alle Impfungen" 
                                  : selectedFilter === "self" 
                                    ? "Meine Impfungen"
                                    : `Impfungen: ${children.find(c => c.id === selectedFilter)?.first_name || ''}`
                                }
                              </span>
                            </CardTitle>
                            <CardDescription className="hidden sm:block">
                              Verwalten Sie Ihre Impfnachweise
                            </CardDescription>
                          </div>
                          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button onClick={() => setShowScanDialog(true)} variant="outline" size="icon" className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3">
                                    <Camera className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Scannen</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="sm:hidden">
                                  <p>Scannen</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button onClick={() => setShowAddDialog(true)} size="icon" className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3">
                                    <Plus className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Hinzufügen</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="sm:hidden">
                                  <p>Hinzufügen</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
                            highlightedChildId={selectedFilter}
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
