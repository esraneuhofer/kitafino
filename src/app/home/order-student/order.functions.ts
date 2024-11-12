import {CustomerInterface, DeadlineDailyInterface} from "../../classes/customer.class";
import {OrderInterfaceStudent} from "../../classes/order_student.class";
import {OrderInterfaceStudentSave} from "../../classes/order_student_safe.class";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {GeneralSettingsInterface} from "../../classes/customer.class";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import {extractTime} from "../../functions/date.functions";

dayjs.extend(weekOfYear);  // Fügt week() Funktion hinzu
dayjs.extend(isoWeek);     // Fügt isoWeek() Funktion hinzu
dayjs.extend(utc);
dayjs.extend(timezone);

export function isCancelOrderPossibleDashboard(generalSettings:GeneralSettingsInterface,orderDate:Date):number{
  if(generalSettings.isDeadlineDaily){
    return timeDifferenceDay(generalSettings.deadlineDaily, orderDate)
  }else{
    let kw = getWeekNumber(orderDate);
    let year = orderDate.getFullYear();
    return getDeadlineWeeklyFunction(generalSettings, kw, getWeekNumber(new Date()), new Date().getFullYear(), year);
  }


}
export function timeDifference(difference:number,withSeconds:boolean):string {
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  difference %= (1000 * 60 * 60 * 24);  // subtract the days

  const hours = Math.floor(difference / (1000 * 60 * 60));
  difference %= (1000 * 60 * 60);  // subtract the hours

  const minutes = Math.floor(difference / (1000 * 60));
  difference %= (1000 * 60);  // subtract the minutes

  const seconds = Math.floor(difference / 1000);
  if(withSeconds){
      return `${days > 0 ? days + ' Tag' + (days === 1 ? '' : 'e') + ', ' : ''}${hours} Std, ${minutes} min,  ${seconds} sek`;
  }
  return `${days > 0 ? days + ' Tag' + (days === 1 ? '' : 'e') + ', ' : ''}${hours} Std, ${minutes} min`;
}

export function timeDifferenceDay(deadLineDaily: DeadlineDailyInterface, dateInputCompare: Date): number {
  let dayOrder = new Date(dateInputCompare);
  const daysSub = addDayFromDate(dayOrder, -deadLineDaily.day);

  // Split the time string into hours and minutes
  const [hours_, minutes_] = deadLineDaily.time.split(':').map(Number);

  daysSub.setHours(hours_);
  daysSub.setMinutes(minutes_);
  daysSub.setSeconds(0);

  let difference = daysSub.getTime() - new Date().getTime();  // to ensure we get a positive difference
  return difference;
}

export function addDayFromDate(date:Date, daysToAdd:number) {
  ///Adds x-Amount of Days to specific Day
  let d = new Date(date);
  let daysAhead = d.setDate(d.getDate() + daysToAdd);
  return new Date(daysAhead);
}


export function getWeekNumber(date: string | Date): number {
  if (typeof date === 'string') {
    return dayjs(date).tz('Europe/Berlin').isoWeek();
  } else {
    return dayjs(date).tz('Europe/Berlin').isoWeek();
  }
}
export function getSplit(customer:CustomerInterface):string[]{
  let array:string[] = [];
  customer.order.split.forEach(eachGroup => {
    array.push(eachGroup.group);
  });
  return array;
}

export function getTotalPriceSafe (orderStudent:OrderInterfaceStudentSave) {
  let totalPrice = 0;
  orderStudent.order.orderMenus.forEach((order) => {
    totalPrice += order.amountOrder * order.priceOrder
  })
  orderStudent.order.specialFoodOrder.forEach((order) => {
    totalPrice += order.amountSpecialFood * order.priceOrder;
  })
  return totalPrice;
}

export function getDisplayOrderType(tenantStudent:TenantStudentInterface,type:boolean):boolean{
 if(tenantStudent.orderSettings.displayTypeOrderWeek){
    return true
 }
  return type;
}


export function getDeadlineWeeklyFunction(customerGeneralSettings:GeneralSettingsInterface, weekNumber:number, startWeekNumber:number, startYear:number, endYear:number):number {
  if (!weekNumber) {
    return -1;
  }
  let yearsDiff = endYear - startYear;
  let end: any = getDeadLineEnd(customerGeneralSettings.deadlineWeekly, weekNumber, startWeekNumber, yearsDiff, startYear);
  let now:any = new Date();
  return end - now;
}

function getDeadLineEnd(object:{ weeks: string; day: string; time: string; }, weeknumber:number, startWeek:number, yearsDiff:number, startYear:number) {
  function getSub() {
    let num = 0;
    if (new Date().getDay() === 0) {
      num = -1;
    }
    return num;
  }
  if (yearsDiff !== 0) {
    let sub = getSub();
    let diff = weeknumber + sub - startWeek - (parseFloat(object.weeks));
    let days = parseInt(object.day) - (new Date()).getDay() + (7 * diff) + (365 * yearsDiff);
    if (startYear === 2020) {
      days += 6;
    }
    let deadLine = addDayFromDate(new Date,days);
    let dayDeadLine = deadLine.getDate();
    let yearDeadLine = deadLine.getFullYear();
    let monthDeadLine = deadLine.getMonth();
    let hours = extractTime(object.time).hours;
    let min = extractTime(object.time).minutes;
    return new Date(yearDeadLine, monthDeadLine, dayDeadLine, hours, min, 0, 0);
  } else {
    let sub = getSub();
    let diff = weeknumber + sub - startWeek - (parseFloat(object.weeks));
    let days = parseInt(object.day) - (new Date()).getDay() + (7 * diff);
    let deadLine =addDayFromDate(new Date,days);
    let dayDeadLine = deadLine.getDate();
    let yearDeadLine = deadLine.getFullYear();
    let monthDeadLine = deadLine.getMonth();
    let hours = extractTime(object.time).hours;
    let min = extractTime(object.time).minutes;
    return new Date(yearDeadLine, monthDeadLine, dayDeadLine, hours, min, 0, 0);
  }

}

// Neue Version der addDayFromDate Funktion für String-Daten
export function addDayFromDateString(dateString: string, daysToAdd: number): string {
  return dayjs(dateString)
    .tz('Europe/Berlin')
    .add(daysToAdd, 'day')
    .format('YYYY-MM-DD');
}

// Hilfsfunktion um die nächsten 5 Werktage zu bekommen
export function getNextFiveWorkdays(startDateString: string): string[] {
  const workdays: string[] = [];
  let currentDay = dayjs(startDateString).tz('Europe/Berlin');
  let daysAdded = 0;

  while (workdays.length < 5) {
    const dayString = currentDay.format('YYYY-MM-DD');
    const dayOfWeek = currentDay.day(); // 0 = Sonntag, 6 = Samstag

    // Füge nur Werktage hinzu (Montag bis Freitag)
    if (dayOfWeek > 0 && dayOfWeek < 6) {
      workdays.push(dayString);
    }

    currentDay = currentDay.add(1, 'day');
  }

  return workdays;
}

