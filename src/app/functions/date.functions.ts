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
  let formatted = moment(new Date()).format('YYYY-DD-YY HH:mm:ss') + ' Uhr';
  return formatted;
}
