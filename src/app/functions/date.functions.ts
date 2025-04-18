import {VacationsInterface} from "../classes/vacation.interface";
import {addDayFromDate} from "../home/order-student/order.functions";
import {numberFive} from "../classes/weekplan.interface";
import {isHoliday} from 'feiertagejs';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import {CustomerInterface} from "../classes/customer.class";
import {TranslateService} from "@ngx-translate/core";
import { VacationStudent } from "../service/vacation.service";

dayjs.extend(utc);
dayjs.extend(timezone);

export function normalizeToBerlinDate(date: Date | string): string {
  return dayjs(date)
    .tz('Europe/Berlin')
    .format('YYYY-MM-DD');
}
export function getLockDays(date:string, allVacations:VacationsInterface[],allVacationsTenant:VacationStudent[], state:any):boolean[] {
  let lockDay = [false, false, false, false, false];
  let dateMonday = getMonday(date);
  var startDay = addDayFromDate(dateMonday, 0);
  for (var i = 0; i < numberFive.length; i++) {
    if (isHoliday(startDay, state) || isVacation(startDay, allVacations) || isVacation(startDay, allVacationsTenant)) {
      lockDay[i] = true;
    }
    startDay = addDayFromDate(startDay, 1);
  }
  return lockDay;
}


function isVacation(inputDate:Date,vacationArray:VacationsInterface[] | VacationStudent[]):boolean{
  if (!vacationArray || vacationArray.length === 0) return false;
  let dateToCompare = setDateToCompare(inputDate);
  let bool =false;
  for(let i = 0;i<vacationArray.length; i ++){
    let start = setDateToCompare(vacationArray[i].vacation.vacationStart);
   
    if(!vacationArray[i].vacation.vacationEnd){
      if(start === dateToCompare){
        bool = true;
      }
    }else{
      let end =setDateToCompare(vacationArray[i].vacation.vacationEnd!);
      if(setDateToCompare(vacationArray[i].vacation.vacationStart) === setDateToCompare(inputDate)){
        bool = true;
      }
      else{
        if (end >= dateToCompare && start <= dateToCompare) {
          bool = true;
        }
      }
    }
  }
  return bool;
}

export function setDateToCompare(input:Date): number {
  let newDate = new Date(input);
  newDate.setHours(0, 0, 0, 0);
  let d = newDate.getTime();
  return d;
}

export function getMonday(inputDate: string): Date {
  // Create a new Date object to avoid modifying the input date
  const date = new Date(inputDate);

  // The getDay() method returns the day of the week: 0 for Sunday, 1 for Monday, ... 6 for Saturday
  const dayOfWeek = date.getDay();

  // Calculate the number of days to subtract from the given date to get to the previous Monday
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;  // If it's Sunday, subtract 6 days. Otherwise, subtract (dayOfWeek - 1) days.

  // Subtract the necessary days
  date.setDate(date.getDate() - daysToSubtract);

  return date;
}

export function checkDayWeekend(day:string):boolean{
  let indexDay = new Date(day).getDay();
  if (indexDay === 6 || indexDay === 0) {
    return true;
  }
  return false;
}

export function getCustomDayIndex(date: string | Date): number {
  // Konvertiere zu dayjs, egal ob String oder Date als Input
  const dayJsDate = dayjs(date).tz('Europe/Berlin');

  const standardDayIndex = dayJsDate.day();
  return (standardDayIndex + 6) % 7;
}
export function getFormattedDate(date:Date) {
  let result = new Date(date);
  let month:any = result.getMonth()+1;
  let num = result.getDate();

  if (month.toString().length == 1) {
    month = "0" + month;
  }
  let sliced =  ('0' + num).slice(-2);
  return (sliced + '.' +month);
}

export function getInvoiceDateOne(date:Date) {
  let result = new Date(date);
  let month:any = result.getMonth()+1;
  let year  = result.getFullYear();
  let num = result.getDate();
  if (month.toString().length == 1) {
    month = "0" + month;
  }
  let sliced =  ('0' + num).slice(-2);
  return (sliced + '.' +month  + '.' + year);
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
},translate:TranslateService): string {
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
},type:string): string {
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

  if(type === 'deadline'){
    return  `Die Bestellfrist endet immer am ${day} um ${time} Uhr.`;
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
},type:string,translate:TranslateService): string {

  let daysString = translate.instant("VORTAG")
  if(deadline.day !== "1"){
    daysString = deadline.day + ' ' + translate.instant("TAGE_VOR_DEM_JEWEILIGEM")
  }
  const time = deadline.time

  if(type === 'deadline'){
    return  `${translate.instant("BESTELLFRIST_ENDET_IMMER")} ${daysString} ${translate.instant("UM")}  ${time} Uhr.`;
  }
  return `${translate.instant("ABBESTELLFRIST_ENDET_IMMER")} ${daysString} ${time} Uhr.`;

}
export function getBestellfrist(customer:CustomerInterface,translate:TranslateService):string{
  let string = '';
  if(customer.generalSettings.isDeadlineDaily){
      return generateDailyDeadlineFixSentence(customer.generalSettings.deadlineDaily,'deadline',translate)
  }else{
    return generateScheduleSentence(customer.generalSettings.deadlineWeekly,translate)
  }
}


export function  extractTime(time: string): { hours: number, minutes: number } {

  // Split the time string into hours and minutes
  const [hours, minutes] = time.split(':').map(Number);

  // Return hours and minutes as an object
  return {
    hours: hours,
    minutes: minutes
  };
}
