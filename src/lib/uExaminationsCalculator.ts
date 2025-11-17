import { addDays, addMonths } from 'date-fns';

export interface UExaminationSchedule {
  type: string;
  daysFromBirth: number;
  description: string;
}

export const U_EXAMINATIONS: UExaminationSchedule[] = [
  { type: 'U1', daysFromBirth: 0, description: 'Direkt nach der Geburt' },
  { type: 'U2', daysFromBirth: 7, description: '3. bis 10. Lebenstag' },
  { type: 'U3', daysFromBirth: 31, description: '4. bis 5. Lebenswoche' },
  { type: 'U4', daysFromBirth: 105, description: '3. bis 4. Lebensmonat' },
  { type: 'U5', daysFromBirth: 195, description: '6. bis 7. Lebensmonat' },
  { type: 'U6', daysFromBirth: 330, description: '10. bis 12. Lebensmonat' },
  { type: 'U7', daysFromBirth: 675, description: '21. bis 24. Lebensmonat (ca. 2 Jahre)' },
  { type: 'U7a', daysFromBirth: 1050, description: '34. bis 36. Lebensmonat (ca. 3 Jahre)' },
  { type: 'U8', daysFromBirth: 1410, description: '46. bis 48. Lebensmonat (ca. 4 Jahre)' },
  { type: 'U9', daysFromBirth: 1860, description: '60. bis 64. Lebensmonat (ca. 5 Jahre)' },
];

export function calculateDueDate(dateOfBirth: Date, examinationType: string): Date {
  const examination = U_EXAMINATIONS.find(u => u.type === examinationType);
  if (!examination) {
    throw new Error(`Unknown examination type: ${examinationType}`);
  }
  return addDays(dateOfBirth, examination.daysFromBirth);
}

export function generateAllDueDates(dateOfBirth: Date): Array<{ type: string; dueDate: Date; description: string }> {
  return U_EXAMINATIONS.map(exam => ({
    type: exam.type,
    dueDate: addDays(dateOfBirth, exam.daysFromBirth),
    description: exam.description
  }));
}
