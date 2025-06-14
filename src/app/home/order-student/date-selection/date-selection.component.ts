import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { getWeekNumber, timeDifference } from "../order.functions";
import { SettingInterfaceNew } from "../../../classes/setting.class";
import { getCalenderQuery, getYearsQuery } from "./date-selection.functions";
import { QueryInterOrderInterface } from "../../../functions/weekplan.functions";
import { StudentInterface } from "../../../classes/student.class";

interface CalendarWeek {
  value: string;
  week: number;
  year: number
}

/**
 * Berechnet die ISO-Wochennummer für ein gegebenes Datum.
 * @param date Datum, für das die Wochennummer berechnet werden soll
 * @returns ISO-Wochennummer
 */
function getISOWeekNumber(date: Date): number {
  const tmpDate = new Date(date.valueOf());
  tmpDate.setHours(0, 0, 0, 0);
  // Donnerstag der aktuellen Woche bestimmen
  tmpDate.setDate(tmpDate.getDate() + 3 - ((tmpDate.getDay() + 6) % 7));
  const firstThursday = new Date(tmpDate.getFullYear(), 0, 4);
  // Erster Donnerstag des Jahres
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  // Berechnung der Wochenanzahl
  const weekNumber = 1 + Math.round(((tmpDate.getTime() - firstThursday.getTime()) / 86400000 - 3) / 7);
  return weekNumber;
}

/**
 * Generiert ein Array von Kalenderwochen von -5 bis +35 Wochen relativ zur aktuellen Woche.
 * Die Berechnung erfolgt nach der deutschen (ISO) Wochenberechnung, inklusive korrekter Jahresübergänge.
 *
 * @returns {CalendarWeek[]} Array der Kalenderwochen
 */
function getQueryCalenderWeek(): CalendarWeek[] {
  const queryCalenderWeek: CalendarWeek[] = []; // Lokales Array

  const currentDate = new Date();

  /**
   * Bestimmt den Montag der aktuellen Woche.
   * @param date Aktuelles Datum
   * @returns Datum des Montags der aktuellen Woche
   */
  function getMonday(date: Date): Date {
    const day = date.getDay(); // Sonntag = 0, Montag = 1, ..., Samstag = 6
    const diff = (day === 0 ? -6 : 1) - day; // Berechnung der Differenz zum Montag
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0); // Zeit auf Mitternacht setzen
    return monday;
  }



  /**
   * Formatiert ein Datum im Format DD.MM.
   * @param date Zu formatierendes Datum
   * @returns Formatierter Datumsstring
   */
  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  }

  // Bestimme den Montag der aktuellen Woche
  const currentMonday = getMonday(currentDate);

  // Schleife von -5 bis +35 Wochen
  for (let offset = -5; offset <= 35; offset++) {
    // Berechne das Datum des Montags für die aktuelle Offset-Woche
    const weekMonday = new Date(currentMonday);
    weekMonday.setDate(currentMonday.getDate() + offset * 7);

    // Berechne das Datum des Sonntags für die aktuelle Offset-Woche
    const weekSunday = new Date(weekMonday);
    weekSunday.setDate(weekMonday.getDate() + 6);

    // Erhalte die ISO-Wochennummer
    const weekNumber = getISOWeekNumber(weekMonday);

    // Bestimme das Jahr für die Darstellung (Jahr des Sonntags)
    const year = weekSunday.getFullYear();

    // Erstelle den formatierten Wertstring
    const value = `KW:${weekNumber} | ${formatDate(weekMonday)} - ${formatDate(weekSunday)}.${year}`;

    // Füge das Objekt zum Array hinzu
    queryCalenderWeek.push({ value, week: weekNumber, year: year });
  }

  return queryCalenderWeek;
}

// Beispielhafte Nutzung der Funktion
const kalenderWochen = getQueryCalenderWeek();

@Component({
  selector: 'app-date-selection',
  templateUrl: './date-selection.component.html',
  styleUrls: ['./date-selection.component.scss']
})
export class DateSelectionComponent implements OnInit {


  @Input() registeredStudents!: StudentInterface[];
  @Input() settings!: SettingInterfaceNew;
  @Input() minWidth: boolean = false;
  @Output() getOrderWeek: any = new EventEmitter<QueryInterOrderInterface>();
  @Output() selectStudent: any = new EventEmitter<StudentInterface | null>();
  @Output() editDisplaySettings: any = new EventEmitter<boolean>();

  @Input() displaySettings: boolean = false;


  selectedStudent: (StudentInterface | null) = null;
  queryCalenderWeek: { value: string; week: number, year: number }[] = [];
  query: QueryInterOrderInterface = { week: getWeekNumber(new Date()), year: new Date().getFullYear() };
  generatedKWArray: { value: string; week: number }[][] = [];

  constructor() {
  }

  ngOnInit() {

    this.generatedKWArray = getCalenderQuery(new Date().getFullYear());
    this.queryCalenderWeek = getQueryCalenderWeek();
    this.setCurrentWeek();

    if (this.registeredStudents.length >= 1) {
      this.selectedStudent = this.registeredStudents[0];
      this.selectStudent.emit(this.selectedStudent)
    }
  }

  setCurrentWeek(): void {
    const today = new Date();
    this.query.week = getISOWeekNumber(today);
  }

  initOrderForWeek(event: number, selectedStudent: StudentInterface | null) {
    this.query.week = event;
    this.getOrderWeek.emit(this.query)
  }


  setStudent(student: StudentInterface | null) {
    this.selectedStudent = student;
    this.selectStudent.emit(this.selectedStudent)
  }

  editTenantOrderSettings(event: boolean): void {
    this.editDisplaySettings.emit(event)
  }
}
