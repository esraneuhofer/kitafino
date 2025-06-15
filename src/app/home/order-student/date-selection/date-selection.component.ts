import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { getWeekNumber, timeDifference } from "../order.functions";
import { SettingInterfaceNew } from "../../../classes/setting.class";
import { getCalenderQuery, getYearsQuery } from "./date-selection.functions";
import { QueryInterOrderInterface } from "../../../functions/weekplan.functions";
import { StudentInterface } from "../../../classes/student.class";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface CalendarWeek {
  value: string;
  week: number;
  year: number
}

/**
 * Generiert ein Array von Kalenderwochen von -5 bis +35 Wochen relativ zur aktuellen Woche.
 * Die Berechnung erfolgt nach der deutschen (ISO) Wochenberechnung, inklusive korrekter Jahresübergänge.
 *
 * @returns {CalendarWeek[]} Array der Kalenderwochen
 */
function getQueryCalenderWeek(): CalendarWeek[] {
  const queryCalenderWeek: CalendarWeek[] = []; // Lokales Array

  // Aktuelle Zeit in Berlin als string
  const currentDateString = dayjs.tz(dayjs(), 'Europe/Berlin').format('YYYY-MM-DD');

  /**
   * Formatiert ein Datum im Format DD.MM.
   * @param dateString Zu formatierendes Datum (YYYY-MM-DD)
   * @returns Formatierter Datumsstring
   */
  function formatDate(dateString: string): string {
    const date = dayjs.tz(dateString, 'Europe/Berlin');
    return date.format('DD.MM');
  }

  // Bestimme den Montag der aktuellen Woche in Berlin-Zeit
  const currentMonday = dayjs.tz(currentDateString, 'Europe/Berlin').startOf('isoWeek');

  // Schleife von -5 bis +35 Wochen
  for (let offset = -5; offset <= 35; offset++) {
    // Berechne das Datum des Montags für die aktuelle Offset-Woche
    const weekMonday = currentMonday.add(offset, 'week');

    // Berechne das Datum des Sonntags für die aktuelle Offset-Woche
    const weekSunday = weekMonday.add(6, 'day');

    // Erhalte die ISO-Wochennummer
    const weekNumber = weekMonday.isoWeek();

    // Bestimme das Jahr für die Darstellung (Jahr des Sonntags)
    const year = weekSunday.year();

    // Erstelle den formatierten Wertstring
    const value = `KW:${weekNumber} | ${formatDate(weekMonday.format('YYYY-MM-DD'))} - ${formatDate(weekSunday.format('YYYY-MM-DD'))}.${year}`;

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
  query: QueryInterOrderInterface = (() => {
    const berlinNow = dayjs.tz(dayjs(), 'Europe/Berlin');
    return {
      week: getWeekNumber(berlinNow.format('YYYY-MM-DD')),
      year: berlinNow.year()
    };
  })();
  generatedKWArray: { value: string; week: number }[][] = [];

  constructor() {
  }

  ngOnInit() {
    console.log('query', this.query);
    const berlinNow = dayjs.tz(dayjs(), 'Europe/Berlin');
    this.generatedKWArray = getCalenderQuery(berlinNow.year());
    this.queryCalenderWeek = getQueryCalenderWeek();
    this.setCurrentWeek();

    if (this.registeredStudents.length >= 1) {
      this.selectedStudent = this.registeredStudents[0];
      this.selectStudent.emit(this.selectedStudent)
    }
  }

  setCurrentWeek(): void {
    // Verwende getWeekNumber für Konsistenz mit dem Rest der App
    const todayString = dayjs.tz(dayjs(), 'Europe/Berlin').format('YYYY-MM-DD');
    this.query.week = getWeekNumber(todayString);
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
