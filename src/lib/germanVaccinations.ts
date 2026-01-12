export interface GermanVaccination {
  id: string;
  name: string;
  description: string;
  category: "Standard" | "Erwachsene" | "COVID-19" | "Reise" | "Regional" | "Sonstige";
}

export const GERMAN_VACCINATIONS: GermanVaccination[] = [
  // Standardimpfungen (Säuglinge/Kinder)
  { id: "tetanus", name: "Tetanus (Wundstarrkrampf)", description: "Bakterielle Infektion", category: "Standard" },
  { id: "diphtherie", name: "Diphtherie", description: "Bakterielle Infektion der Atemwege", category: "Standard" },
  { id: "pertussis", name: "Pertussis (Keuchhusten)", description: "Bakterielle Atemwegsinfektion", category: "Standard" },
  { id: "polio", name: "Poliomyelitis (Kinderlähmung)", description: "Virale Infektion", category: "Standard" },
  { id: "hib", name: "Haemophilus influenzae Typ b (Hib)", description: "Bakterielle Infektion", category: "Standard" },
  { id: "hepatitis_b", name: "Hepatitis B", description: "Virale Leberentzündung", category: "Standard" },
  { id: "pneumokokken", name: "Pneumokokken", description: "Bakterielle Infektion", category: "Standard" },
  { id: "rotaviren", name: "Rotaviren", description: "Virale Magen-Darm-Infektion", category: "Standard" },
  { id: "meningokokken_c", name: "Meningokokken C", description: "Bakterielle Hirnhautentzündung", category: "Standard" },
  { id: "meningokokken_b", name: "Meningokokken B", description: "Bakterielle Hirnhautentzündung", category: "Standard" },
  { id: "masern", name: "Masern", description: "Virale Infektion", category: "Standard" },
  { id: "mumps", name: "Mumps (Ziegenpeter)", description: "Virale Infektion", category: "Standard" },
  { id: "roeteln", name: "Röteln", description: "Virale Infektion", category: "Standard" },
  { id: "varizellen", name: "Varizellen (Windpocken)", description: "Virale Infektion", category: "Standard" },
  { id: "hpv", name: "HPV (Humane Papillomviren)", description: "Schutz vor Gebärmutterhalskrebs", category: "Standard" },
  
  // Erwachsenen-Impfungen
  { id: "influenza", name: "Influenza (Grippe)", description: "Jährliche Schutzimpfung", category: "Erwachsene" },
  { id: "herpes_zoster", name: "Herpes Zoster (Gürtelrose)", description: "Für Personen ab 50 Jahren", category: "Erwachsene" },
  { id: "rsv", name: "RSV (Respiratorisches Synzytial-Virus)", description: "Atemwegsinfektion", category: "Erwachsene" },
  
  // COVID-19
  { id: "covid19", name: "COVID-19", description: "Corona-Schutzimpfung", category: "COVID-19" },
  
  // Reiseimpfungen
  { id: "hepatitis_a", name: "Hepatitis A", description: "Reiseimpfung", category: "Reise" },
  { id: "typhus", name: "Typhus", description: "Reiseimpfung", category: "Reise" },
  { id: "tollwut", name: "Tollwut", description: "Reiseimpfung bei Tierkontakt", category: "Reise" },
  { id: "gelbfieber", name: "Gelbfieber", description: "Pflichtimpfung für bestimmte Länder", category: "Reise" },
  { id: "japanische_enzephalitis", name: "Japanische Enzephalitis", description: "Reiseimpfung Asien", category: "Reise" },
  { id: "cholera", name: "Cholera", description: "Reiseimpfung", category: "Reise" },
  { id: "meningokokken_acwy", name: "Meningokokken ACWY", description: "Reiseimpfung Afrika/Asien", category: "Reise" },
  { id: "dengue", name: "Dengue-Fieber", description: "Reiseimpfung für Endemiegebiete", category: "Reise" },
  
  // Regionale Impfungen
  { id: "fsme", name: "FSME (Frühsommer-Meningoenzephalitis)", description: "Zeckenschutzimpfung", category: "Regional" },
  
  // Sonstige
  { id: "sonstige", name: "Sonstige Impfung", description: "Andere Impfung (manuelle Eingabe)", category: "Sonstige" },
];

export const VACCINATION_CATEGORIES = [
  { id: "Standard", label: "Standardimpfungen (STIKO)" },
  { id: "Erwachsene", label: "Erwachsenen-Impfungen" },
  { id: "COVID-19", label: "COVID-19" },
  { id: "Reise", label: "Reiseimpfungen" },
  { id: "Regional", label: "Regionale Impfungen" },
  { id: "Sonstige", label: "Sonstige" },
] as const;

export const getVaccinationsByCategory = (category: GermanVaccination["category"]) => {
  return GERMAN_VACCINATIONS.filter((v) => v.category === category);
};

export const findVaccinationByName = (name: string): GermanVaccination | undefined => {
  return GERMAN_VACCINATIONS.find(
    (v) => v.name.toLowerCase() === name.toLowerCase() || v.id === name.toLowerCase()
  );
};
