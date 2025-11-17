import { format } from "date-fns";

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  reminder?: number; // minutes before event
}

export function generateICS(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const now = new Date();
  const startDate = formatDate(event.startDate);
  const endDate = event.endDate ? formatDate(event.endDate) : startDate;
  const timestamp = formatDate(now);
  
  // Generate unique ID
  const uid = `${timestamp}-${Math.random().toString(36).substr(2, 9)}@lovable.app`;

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lovable//U-Untersuchungen Tracker//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
  ];

  if (event.location) {
    icsContent.push(`LOCATION:${event.location}`);
  }

  if (event.reminder) {
    icsContent.push('BEGIN:VALARM');
    icsContent.push('ACTION:DISPLAY');
    icsContent.push(`DESCRIPTION:${event.title}`);
    icsContent.push(`TRIGGER:-PT${event.reminder}M`);
    icsContent.push('END:VALARM');
  }

  icsContent.push('STATUS:CONFIRMED');
  icsContent.push('SEQUENCE:0');
  icsContent.push('END:VEVENT');
  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n');
}

export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function exportUExaminationToCalendar(
  examinationType: string,
  dueDate: string,
  childName: string,
  description?: string
): void {
  const dueDateObj = new Date(dueDate);
  
  // Set time to 9:00 AM for the appointment
  dueDateObj.setHours(9, 0, 0, 0);
  
  // End time 1 hour later (10:00 AM)
  const endDateObj = new Date(dueDateObj);
  endDateObj.setHours(10, 0, 0, 0);

  const event: CalendarEvent = {
    title: `${examinationType} - ${childName}`,
    description: description || `${examinationType} für ${childName}\n\nBitte vereinbaren Sie rechtzeitig einen Termin beim Kinderarzt.`,
    startDate: dueDateObj,
    endDate: endDateObj,
    location: 'Kinderarztpraxis',
    reminder: 10080, // 7 days before (7 * 24 * 60 minutes)
  };

  const icsContent = generateICS(event);
  const filename = `${examinationType}-${childName.replace(/\s/g, '-')}.ics`;
  
  downloadICS(icsContent, filename);
}
