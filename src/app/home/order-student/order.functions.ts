import {CustomerInterface, DeadlineDailyInterface} from "../../classes/customer.class";
import {OrderInterfaceStudent} from "../../classes/order_student.class";
import {OrderInterfaceStudentSave} from "../../classes/order_student_safe.class";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {GeneralSettingsInterface} from "../../classes/customer.class";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import {extractTime} from "../../functions/date.functions";

dayjs.extend(utc);
dayjs.extend(timezone);

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


export function getWeekNumber(startDate:Date) {
  let d: any = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  let dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  let yearStart: any = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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
    console.log(object.time)
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

