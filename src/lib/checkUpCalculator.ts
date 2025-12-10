import { addMonths, differenceInYears } from 'date-fns';

export interface CheckUpSchedule {
  type: string;
  description: string;
  minAge: number; // in years
  maxAge?: number; // in years (optional, if not set = indefinite)
  intervalMonths: number;
  gender: 'all' | 'male' | 'female';
}

export const ADULT_CHECK_UPS: CheckUpSchedule[] = [
  // Zahnvorsorge - ab 18 Jahren, alle 6 Monate
  {
    type: 'Zahnvorsorge',
    description: 'Zahnärztliche Kontrolluntersuchung (Bonusheft wichtig)',
    minAge: 18,
    intervalMonths: 6,
    gender: 'all',
  },
  // Gebärmutterhalskrebs-Screening - Frauen ab 20, jährlich bis 35
  {
    type: 'Gebärmutterhalskrebs-Screening',
    description: 'Pap-Abstrich zur Früherkennung von Gebärmutterhalskrebs',
    minAge: 20,
    maxAge: 34,
    intervalMonths: 12,
    gender: 'female',
  },
  // Gebärmutterhalskrebs-Screening - Frauen ab 35, alle 3 Jahre
  {
    type: 'Gebärmutterhalskrebs-Screening',
    description: 'Kombi-Test: Pap-Abstrich und HPV-Test',
    minAge: 35,
    intervalMonths: 36,
    gender: 'female',
  },
  // Brustkrebsvorsorge - Frauen ab 30, jährlich
  {
    type: 'Brustkrebsvorsorge',
    description: 'Abtasten der Brust und Achsel-Lymphknoten',
    minAge: 30,
    intervalMonths: 12,
    gender: 'female',
  },
  // Mammographie - Frauen ab 50, alle 2 Jahre
  {
    type: 'Mammographie',
    description: 'Mammographie-Screening zur Brustkrebsfrüherkennung',
    minAge: 50,
    maxAge: 75,
    intervalMonths: 24,
    gender: 'female',
  },
  // Check-up ab 35 - alle 3 Jahre
  {
    type: 'Gesundheits-Check-up',
    description: 'Allgemeiner Check-up: Anamnese, Untersuchung, Labor, Impfstatus',
    minAge: 35,
    intervalMonths: 36,
    gender: 'all',
  },
  // Hautkrebs-Screening - ab 35, alle 2 Jahre
  {
    type: 'Hautkrebs-Screening',
    description: 'Untersuchung der Haut beim Hautarzt oder Hausarzt',
    minAge: 35,
    intervalMonths: 24,
    gender: 'all',
  },
  // Prostatakrebs-Vorsorge - Männer ab 45, jährlich
  {
    type: 'Prostatakrebs-Vorsorge',
    description: 'Tastuntersuchung der Prostata beim Urologen',
    minAge: 45,
    intervalMonths: 12,
    gender: 'male',
  },
  // Darmkrebsvorsorge - ab 50, variabel
  {
    type: 'Darmkrebsvorsorge',
    description: 'Stuhltest (jährlich) oder Darmspiegelung nach festgelegten Intervallen',
    minAge: 50,
    intervalMonths: 12,
    gender: 'all',
  },
];

export function getApplicableCheckUps(
  dateOfBirth: Date,
  gender: 'male' | 'female' | 'diverse'
): CheckUpSchedule[] {
  const age = differenceInYears(new Date(), dateOfBirth);
  
  return ADULT_CHECK_UPS.filter(checkUp => {
    // Check age
    if (age < checkUp.minAge) return false;
    if (checkUp.maxAge && age > checkUp.maxAge) return false;
    
    // Check gender
    if (checkUp.gender === 'all') return true;
    if (checkUp.gender === gender) return true;
    // For diverse, include both male and female specific check-ups as options
    if (gender === 'diverse') return true;
    
    return false;
  });
}

export function calculateNextDueDate(lastDate: Date | null, intervalMonths: number): Date {
  if (!lastDate) {
    return new Date(); // Due now if never done
  }
  return addMonths(lastDate, intervalMonths);
}

export function generateCheckUpSchedule(
  dateOfBirth: Date,
  gender: 'male' | 'female' | 'diverse'
): Array<{ type: string; description: string; intervalMonths: number }> {
  const applicable = getApplicableCheckUps(dateOfBirth, gender);
  
  // Remove duplicates by type (keep the one matching age better)
  const uniqueByType = new Map<string, CheckUpSchedule>();
  applicable.forEach(checkUp => {
    const existing = uniqueByType.get(checkUp.type);
    if (!existing || checkUp.minAge > existing.minAge) {
      uniqueByType.set(checkUp.type, checkUp);
    }
  });
  
  return Array.from(uniqueByType.values()).map(checkUp => ({
    type: checkUp.type,
    description: checkUp.description,
    intervalMonths: checkUp.intervalMonths,
  }));
}
