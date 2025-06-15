import { VacationsSubgroupInterface } from "../classes/vacation.interface";
import { addDayFromDate } from "../home/order-student/order.functions";
import { numberFive } from "../classes/weekplan.interface";
import { isHoliday } from 'feiertagejs';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { CustomerInterface } from "../classes/customer.class";
import { TranslateService } from "@ngx-translate/core";
import { VacationStudent } from "../service/vacation.service";

dayjs.extend(utc);
dayjs.extend(timezone);

export function normalizeToBerlinDate(date: Date | string): string {
  return dayjs(date)
    .tz('Europe/Berlin')
    .format('YYYY-MM-DD');
}
export function getLockDays(date: string, allVacations: VacationsSubgroupInterface[], allVacationsTenant: VacationStudent[], state: any, groupIdStudent: string): boolean[] {
  let lockDay = [false, false, false, false, false];
  let dateMonday = getMonday(date);
  var startDay = addDayFromDate(dateMonday, 0);
  for (var i = 0; i < numberFive.length; i++) {
    if (isHoliday(startDay, state) || isVacationSubgroup(startDay, allVacations, groupIdStudent) || isVacationStudent(startDay, allVacationsTenant)) {
      lockDay[i] = true;
    }
    startDay = addDayFromDate(startDay, 1);
  }
  return lockDay;
}

export function isSingleLockDay(date: string, allVacations: VacationsSubgroupInterface[], allVacationsTenant: VacationStudent[], state: any, groupIdStudent: string): boolean {
  let lockDay = false;
  let dateMonday = getMonday(date);
  var startDay = addDayFromDate(dateMonday, 0);
  if (isHoliday(startDay, state) || isVacationSubgroup(startDay, allVacations, groupIdStudent) || isVacationStudent(startDay, allVacationsTenant)) {
    lockDay = true;
  }
  return lockDay;
}

export function isVacationSubgroup(inputDate: Date, vacationArray: VacationsSubgroupInterface[], groupIdStudent: string): boolean {
  if (!vacationArray || vacationArray.length === 0) return false;
  let dateToCompare = setDateToCompare(inputDate);
  let bool = false;
  for (let i = 0; i < vacationArray.length; i++) {
    if (vacationArray[i].subgroupId === groupIdStudent || vacationArray[i].subgroupId === 'all') {
      let start = setDateToCompare(vacationArray[i].vacation.vacationStart);
      let end = setDateToCompare(vacationArray[i].vacation.vacationEnd);
      if (!vacationArray[i].vacation.vacationEnd) {
        if (start === dateToCompare) {
          bool = true;
        }
      } else {
        if (setDateToCompare(vacationArray[i].vacation.vacationStart) === setDateToCompare(inputDate)) {
          bool = true;
        }
        else {
          if (end >= dateToCompare && start <= dateToCompare) {
            bool = true;
          }
        }
      }
    }

  }
  return bool;
}


export function isVacationStudent(inputDate: Date, vacationArray: VacationStudent[]): boolean {
  if (!vacationArray || vacationArray.length === 0) return false;
  let dateToCompare = setDateToCompare(inputDate);
  let bool = false;
  for (let i = 0; i < vacationArray.length; i++) {
    let start = setDateToCompare(vacationArray[i].vacation.vacationStart);

    if (!vacationArray[i].vacation.vacationEnd) {
      if (start === dateToCompare) {
        bool = true;
      }
    } else {
      let end = setDateToCompare(vacationArray[i].vacation.vacationEnd!);
      if (setDateToCompare(vacationArray[i].vacation.vacationStart) === setDateToCompare(inputDate)) {
        bool = true;
      }
      else {
        if (end >= dateToCompare && start <= dateToCompare) {
          bool = true;
        }
      }
    }
  }
  return bool;
}

export function setDateToCompare(input: Date): number {
  let newDate = new Date(input);
  newDate.setHours(0, 0, 0, 0);
  let d = newDate.getTime();
  return d;
}

export function getMonday(inputDate: string): Date {
  // Parse Input-Datum in Berlin-Zeit
  const berlinDate = dayjs.tz(inputDate, 'Europe/Berlin');

  if (!berlinDate.isValid()) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  // Finde Montag der Woche in Berlin-Zeit
  const monday = berlinDate.startOf('isoWeek'); // ISO-Woche beginnt montags

  return monday.toDate();
}

export function checkDayWeekend(day: string): boolean {
  // Parse Input-Datum in Berlin-Zeit für konsistente Wochenend-Erkennung
  const berlinDate = dayjs.tz(day, 'Europe/Berlin');

  if (!berlinDate.isValid()) {
    throw new Error(`Invalid date: ${day}`);
  }

  const dayOfWeek = berlinDate.day(); // 0=Sonntag, 6=Samstag
  return dayOfWeek === 0 || dayOfWeek === 6;
}

// export function getCustomDayIndex(date: string | Date): number {
//   // Konvertiere zu dayjs, egal ob String oder Date als Input
//   const dayJsDate = dayjs(date).tz('Europe/Berlin');

//   const standardDayIndex = dayJsDate.day();
//   return (standardDayIndex + 6) % 7;
// }// Get the standard day index (0 for Sunday, 1 for Monday, ..., 6 for Saturday)

// export function getCustomDayIndex(date: string | Date): number {
//   // Konvertiere zu dayjs, egal ob String oder Date als Input
//   const dayJsDate = dayjs(date).tz('Europe/Berlin');

//   // Gib direkt den Standard dayjs Index zurück
//   return dayJsDate.day(); // 0=Sunday, 1=Monday, ..., 6=Saturday
// }
export function getCustomDayIndex(date: string | Date): number {
  const dayJsDate = dayjs.tz(date, 'Europe/Berlin');
  const standardDayIndex = dayJsDate.day();
  return (standardDayIndex + 6) % 7; // 0=Monday, 1=Tuesday, ..., 6=Sunday
}

export function getFormattedDate(date: Date) {
  let result = new Date(date);
  let month: any = result.getMonth() + 1;
  let num = result.getDate();

  if (month.toString().length == 1) {
    month = "0" + month;
  }
  let sliced = ('0' + num).slice(-2);
  return (sliced + '.' + month);
}

export function getInvoiceDateOne(date: Date) {
  // let result = new Date(date);
  let month: any = date.getMonth() + 1;
  let year = date.getFullYear();
  let num = date.getDate();
  if (month.toString().length == 1) {
    month = "0" + month;
  }
  let sliced = ('0' + num).slice(-2);
  return (sliced + '.' + month + '.' + year);
}


export function getTimeToDisplay() {
  let formatted = dayjs().tz('Europe/Berlin').format('DD.MM.YYYY HH:mm:ss') + ' Uhr';
  return formatted;
}


export function formatDateInput(date: Date): string {
  const berlinDate = normalizeToBerlinDate(date);
  return dayjs(berlinDate).format('YYYY-MM-DD');
}


function generateScheduleSentence(schedule: {
  weeks: string;
  day: string;
  time: string;
}, translate: TranslateService): string {
  // Definiere die Wochentage
  const daysOfWeek: { [key: string]: string } = {
    '1': 'Montag',
    '2': 'Dienstag',
    '3': 'Mittwoch',
    '4': 'Donnerstag',
    '5': 'Freitag',
    '6': 'Samstag',
    '7': 'Sonntag'
  };

  const weeks = parseInt(schedule.weeks);
  const day = daysOfWeek[parseInt(schedule.day)] || 'unbekannter Tag';
  const time = schedule.time
  const weekText = weeks === 1 ? translate.instant("IN_DER_VORWOCHE") : `${weeks} ${translate.instant("WOCHEN_VOR_DER_JEWEILIGEN_BESTELLWOCHE")}`;
  const sentence = `${translate.instant("BESTELLFRIST_ENDET_IMMER")} ${weekText}, ${translate.instant("AM")} ${day} ${translate.instant("UM")} ${time} ${translate.instant("UHR")}.`;

  return sentence;
}

function generateDailyDeadlineSentence(deadline: {
  day: string;
  time: Date;
}, type: string): string {
  const daysOfWeek: { [key: number]: string } = {
    1: 'Montag',
    2: 'Dienstag',
    3: 'Mittwoch',
    4: 'Donnerstag',
    5: 'Freitag',
    6: 'Samstag',
    7: 'Sonntag'
  };
  let day = daysOfWeek[parseInt(deadline.day)] || 'unbekannter Tag';
  const time = new Date(deadline.time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  if (type === 'deadline') {
    return `Die Bestellfrist endet immer am ${day} um ${time} Uhr.`;
  }
  return `Die Abbestellfrist endet immer am ${day} um ${time} Uhr.`;

}

// const var = {
//   "VORTAG":"Vortag",
//   "TAGE_VOR_DEM_JEWEILIGEM":"Tage vor dem jeweiligen Essenstag",
//   "BESTELLFRIST_ENDET_IMMER":"Die Bestellfrist endet immer",
//   "ABBESTELLFRIST_ENDET_IMMER":"Die Abbestellfrist endet immer um",
//   "BESTELLFRIST_ENDET_IMMER_VOR":"Die Bestellfrist endet immer vor",
//   "Uhr":"Uhr",
//   "Montag":"Montag",
//   "Dienstag":"Dienstag",
//   "Mittwoch":"Mittwoch",
//   "Donnerstag":"Donnerstag",
//   "Freitag":"Freitag",
//   "AM":"am",
//   "UM":"um",
//   "IN_DER_VORWOCHE":"in der Vorwoche",
//   "WOCHEN_VOR_DER_JEWEILIGEN_BESTELLWOCHE":"Wochen vor der jeweiligen Bestellwoche"
// }
function generateDailyDeadlineFixSentence(deadline: {
  day: string;
  time: string;
}, type: string, translate: TranslateService): string {

  let daysString = translate.instant("VORTAG")
  if (deadline.day !== "1") {
    daysString = deadline.day + ' ' + translate.instant("TAGE_VOR_DEM_JEWEILIGEM")
  }
  const time = deadline.time

  if (type === 'deadline') {
    return `${translate.instant("BESTELLFRIST_ENDET_IMMER")} ${daysString} ${translate.instant("UM")}  ${time} Uhr.`;
  }
  return `${translate.instant("ABBESTELLFRIST_ENDET_IMMER")} ${daysString} ${time} Uhr.`;

}
export function getBestellfrist(customer: CustomerInterface, translate: TranslateService): string {
  let string = '';
  if (customer.generalSettings.isDeadlineDaily) {
    return generateDailyDeadlineFixSentence(customer.generalSettings.deadlineDaily, 'deadline', translate)
  } else {
    return generateScheduleSentence(customer.generalSettings.deadlineWeekly, translate)
  }
}


export function extractTime(time: string): { hours: number, minutes: number } {

  // Split the time string into hours and minutes
  const [hours, minutes] = time.split(':').map(Number);

  // Return hours and minutes as an object
  return {
    hours: hours,
    minutes: minutes
  };
}
