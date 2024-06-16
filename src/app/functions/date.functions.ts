import {VacationsInterface} from "../classes/vacation.interface";
import {addDayFromDate} from "../home/order-student/order.functions";
import {numberFive} from "../classes/weekplan.interface";
import {isHoliday} from 'feiertagejs';
import * as moment from 'moment-timezone';

export function getLockDays(date:string, allVacations:VacationsInterface[], state:any):boolean[] {
  let lockDay = [false, false, false, false, false];
  let dateMonday = getMonday(date);
  var startDay = addDayFromDate(dateMonday, 0);
  for (var i = 0; i < numberFive.length; i++) {
    if (isHoliday(startDay, state) || isVacation(startDay, allVacations)) {
      lockDay[i] = true;
    }
    startDay = addDayFromDate(startDay, 1);
  }
  return lockDay;
}


export function isVacation(inputDate:Date,vacationArray:VacationsInterface[]){
  if(!vacationArray)return;
  let dateToCompare = setDateToCompare(inputDate);
  let bool =false;
  for(let i = 0;i<vacationArray.length; i ++){
    let start = setDateToCompare(vacationArray[i].vacation.vacationStart);
    let end =setDateToCompare(vacationArray[i].vacation.vacationEnd);
    if(!vacationArray[i].vacation.vacationEnd){
      if(start === dateToCompare){
        bool = true;
      }
    }else{
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
export function getCustomDayIndex(date: Date): number {
  // Get the standard day index (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
  const standardDayIndex = date.getDay();

  // Map standard day index to custom day index
  // Standard: 0 (Sunday), 1 (Monday), 2 (Tuesday), 3 (Wednesday), 4 (Thursday), 5 (Friday), 6 (Saturday)
  // Custom:   0 (Monday), 1 (Tuesday), 2 (Wednesday), 3 (Thursday), 4 (Friday), 5 (Saturday), 6 (Sunday)
  const customDayIndex = (standardDayIndex + 6) % 7;

  return customDayIndex;
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
  // Format the date and time using Moment.js
  let formatted = moment(new Date()).format('DD.MM.YYYY HH:mm:ss') + ' Uhr';
  return formatted;
}


export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}


function generateScheduleSentence(schedule: {
  weeks: string;
  day: string;
  time: Date;
}): string {
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
  const time = schedule.time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  const weekText = weeks === 1 ? '1 Woche' : `${weeks} Wochen`;
  const sentence = `Die Bestellfrist endet immer vor ${weekText}, am ${day} um ${time} Uhr.`;

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
  const time = deadline.time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  if(type === 'deadline'){
    return  `Die Bestellfrist endet immer am ${day} um ${time} Uhr.`;
  }
  return `Die Abbestellfrist endet immer am ${day} um ${time} Uhr.`;

}
