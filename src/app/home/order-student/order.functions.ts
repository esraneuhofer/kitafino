import { CustomerInterface, DeadlineDailyInterface } from "../../classes/customer.class";
import { OrderInterfaceStudent } from "../../classes/order_student.class";
import { OrderInterfaceStudentSave } from "../../classes/order_student_safe.class";
import { TenantStudentInterface } from "../../classes/tenant.class";
import { GeneralSettingsInterface } from "../../classes/customer.class";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import { extractTime } from "../../functions/date.functions";
import { OrderAndCancelInterface } from "../order-history/order-history.component";

dayjs.extend(weekOfYear);  // Fügt week() Funktion hinzu
dayjs.extend(isoWeek);     // Fügt isoWeek() Funktion hinzu
dayjs.extend(utc);
dayjs.extend(timezone);

export function isCancelOrderPossibleDashboard(generalSettings: GeneralSettingsInterface, orderDate: Date): number {
  if (generalSettings.isDeadlineDaily) {
    let isNotFormat = !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(generalSettings.cancelOrderDaily.time);
    if (!generalSettings.hasCancelDaily || isNotFormat) {
      // Verwende Weekend-Skip Funktion wenn die Option aktiviert ist
      if (generalSettings.deadlineSkipWeekend) {
        return timeDifferenceDaySkipWeekend(generalSettings.deadlineDaily, orderDate);
      } else {
        return timeDifferenceDay(generalSettings.deadlineDaily, orderDate);
      }
    } else {
      // Verwende Weekend-Skip Funktion für cancel deadline wenn die Option aktiviert ist
      if (generalSettings.deadlineSkipWeekend) {
        return timeDifferenceDaySkipWeekend(generalSettings.cancelOrderDaily, orderDate);
      } else {
        return timeDifferenceDay(generalSettings.cancelOrderDaily, orderDate);
      }
    }

  } else {
    let kw = getWeekNumber(orderDate);
    let year = orderDate.getFullYear();
    let isNotFormat = !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(generalSettings.cancelOrderDaily.time);
    if (!generalSettings.hasCancelDaily || isNotFormat) {
      const nowBerlin = dayjs.tz(dayjs(), 'Europe/Berlin');
      return getDeadlineWeeklyFunction(
        generalSettings,
        kw,
        getWeekNumber(nowBerlin.format('YYYY-MM-DD')),
        nowBerlin.year(),
        year
      );
    } else {
      // Verwende Weekend-Skip Funktion für cancel deadline wenn die Option aktiviert ist
      if (generalSettings.deadlineSkipWeekend) {
        return timeDifferenceDaySkipWeekend(generalSettings.cancelOrderDaily, orderDate);
      } else {
        return timeDifferenceDay(generalSettings.cancelOrderDaily, orderDate);
      }
    }

  }


}

export function timeDifference(difference: number, withSeconds: boolean): string {
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  difference %= (1000 * 60 * 60 * 24);  // subtract the days

  const hours = Math.floor(difference / (1000 * 60 * 60));
  difference %= (1000 * 60 * 60);  // subtract the hours

  const minutes = Math.floor(difference / (1000 * 60));
  difference %= (1000 * 60);  // subtract the minutes

  const seconds = Math.floor(difference / 1000);
  if (withSeconds) {
    return `${days > 0 ? days + ' Tag' + (days === 1 ? '' : 'e') + ', ' : ''}${hours} Std, ${minutes} min,  ${seconds} sek`;
  }
  return `${days > 0 ? days + ' Tag' + (days === 1 ? '' : 'e') + ', ' : ''}${hours} Std, ${minutes} min`;
}

export function timeDifferenceDay(deadLineDaily: DeadlineDailyInterface, dateInputCompare: Date | string): number {
  // Konvertiere das Eingabedatum zu Berliner Zeit
  const dayOrderBerlin = dayjs.tz(dateInputCompare, 'Europe/Berlin');

  // Subtrahiere die Tage in Berliner Zeit
  const daysSub = dayOrderBerlin.subtract(Number(deadLineDaily.day), 'day');

  // Split the time string into hours and minutes
  const [hours_, minutes_] = deadLineDaily.time.split(':').map(Number);

  // Setze die Deadline-Zeit in Berliner Zeit
  const deadlineBerlin = daysSub
    .hour(hours_)
    .minute(minutes_)
    .second(0)
    .millisecond(0);

  // Aktuelle Zeit in Berliner Zeit für konsistente Berechnung
  const nowBerlin = dayjs.tz(new Date(), 'Europe/Berlin');

  // Verwende dayjs.diff() statt .toDate().getTime() für bessere Performance
  const difference = deadlineBerlin.diff(nowBerlin);

  return difference;
}

// Optimierte Version mit besserer Lesbarkeit
export function timeDifferenceDaySkipWeekend(deadLineDaily: DeadlineDailyInterface, dateInputCompare: Date | string): number {
  // Alle Berechnungen in Berliner Zeit
  let currentDay = dayjs.tz(dateInputCompare, 'Europe/Berlin');
  let businessDaysSubtracted = 0;
  const targetBusinessDays = Number(deadLineDaily.day);

  // Subtrahiere nur Werktage (Mo-Fr)
  while (businessDaysSubtracted < targetBusinessDays) {
    currentDay = currentDay.subtract(1, 'day');

    // Nur Werktage zählen (Mo=1, Di=2, Mi=3, Do=4, Fr=5)
    if (currentDay.day() >= 1 && currentDay.day() <= 5) {
      businessDaysSubtracted++;
    }
  }

  // Zeit setzen
  const [hours_, minutes_] = deadLineDaily.time.split(':').map(Number);
  const deadlineBerlin = currentDay
    .hour(hours_)
    .minute(minutes_)
    .second(0)
    .millisecond(0);

  // Aktuelle Zeit in Berliner Zeit
  const nowBerlin = dayjs.tz(new Date(), 'Europe/Berlin');

  return deadlineBerlin.diff(nowBerlin);
}

export function addDayFromDate(date: Date, daysToAdd: number) {
  ///Adds x-Amount of Days to specific Day
  let d = new Date(date);
  let daysAhead = d.setDate(d.getDate() + daysToAdd);
  return new Date(daysAhead);
}


export function getWeekNumber(date: string | Date): number {
  return dayjs.tz(date, 'Europe/Berlin').isoWeek();
}

export function getSplit(customer: CustomerInterface): string[] {
  let array: string[] = [];
  customer.order.split.forEach(eachGroup => {
    array.push(eachGroup.group);
  });
  return array;
}

export function getTotalPriceSafe(orderStudent: OrderInterfaceStudentSave) {
  let totalPrice = 0;
  orderStudent.order.orderMenus.forEach((order) => {
    totalPrice += order.amountOrder * order.priceOrder
  })
  orderStudent.order.specialFoodOrder.forEach((order) => {
    totalPrice += order.amountSpecialFood * order.priceOrder;
  })
  return totalPrice;
}

export function getDisplayOrderType(tenantStudent: TenantStudentInterface, type: boolean): boolean {
  if (tenantStudent.orderSettings.displayTypeOrderWeek) {
    return true
  }
  return type;
}


export function getDeadlineWeeklyFunction(customerGeneralSettings: GeneralSettingsInterface, weekNumber: number, startWeekNumber: number, startYear: number, endYear: number): number {
  if (!weekNumber) {
    return -1;
  }
  let yearsDiff = endYear - startYear;
  let end: any = getDeadLineEnd(customerGeneralSettings.deadlineWeekly, weekNumber, startWeekNumber, yearsDiff, startYear);

  // Aktuelle Zeit in Berliner Zeit für konsistente Berechnung
  let nowBerlin: any = dayjs.tz(new Date(), 'Europe/Berlin').toDate();
  return end - nowBerlin;
}

function getDeadLineEnd(object: { weeks: string; day: string; time: string; }, weeknumber: number, startWeek: number, yearsDiff: number, startYear: number) {
  function getSub() {
    let num = 0;
    // Sonntag-Check in Berliner Zeit
    if (dayjs.tz(new Date(), 'Europe/Berlin').day() === 0) {
      num = -1;
    }
    return num;
  }
  if (yearsDiff !== 0) {
    let sub = getSub();
    let diff = weeknumber + sub - startWeek - (parseFloat(object.weeks));
    let days = parseInt(object.day) - dayjs.tz(new Date(), 'Europe/Berlin').day() + (7 * diff) + (365 * yearsDiff);
    if (startYear === 2020) {
      days += 6;
    }
    let deadLine = dayjs.tz(new Date(), 'Europe/Berlin').add(days, 'day');
    let hours = extractTime(object.time).hours;
    let min = extractTime(object.time).minutes;
    return deadLine.hour(hours).minute(min).second(0).millisecond(0).toDate();
  } else {
    let sub = getSub();
    let diff = weeknumber + sub - startWeek - (parseFloat(object.weeks));
    let days = parseInt(object.day) - dayjs.tz(new Date(), 'Europe/Berlin').day() + (7 * diff);
    let deadLine = dayjs.tz(new Date(), 'Europe/Berlin').add(days, 'day');
    let hours = extractTime(object.time).hours;
    let min = extractTime(object.time).minutes;
    return deadLine.hour(hours).minute(min).second(0).millisecond(0).toDate();
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

function getNameOrder(nameOrder: string): string {
  if (!nameOrder) {
    return 'Menu';
  }
  return nameOrder;
}
export function getOrderPlaced(orderStudent: OrderInterfaceStudentSave): OrderAndCancelInterface {

  let orderPlaced = {
    priceOrder: 0,
    amountOrder: 0,
    nameOrder: '',
    dateOrder: orderStudent.dateOrder,
    datePlaced: orderStudent.createdAt || dayjs.tz(dayjs(), 'Europe/Berlin').toDate(),
    nameStudent: '',
    typeOrder: '',
    isCanceled: false
  }
  if (orderStudent.isCanceled) {
    orderPlaced.isCanceled = true;
  }
  orderStudent.order.orderMenus.forEach(eachOrder => {
    if (eachOrder.amountOrder > 0) {
      orderPlaced.priceOrder = eachOrder.priceOrder;
      orderPlaced.amountOrder = eachOrder.amountOrder;
      orderPlaced.nameOrder = getNameOrder(eachOrder.nameOrder);
    }
  })
  if (orderPlaced.amountOrder === 0) {
    orderStudent.order.specialFoodOrder.forEach(eachOrder => {
      if (eachOrder.amountSpecialFood > 0) {
        orderPlaced.amountOrder = eachOrder.amountSpecialFood;
        orderPlaced.priceOrder = eachOrder.priceOrder;
        orderPlaced.nameOrder = eachOrder.nameSpecialFood
      }
    })
  }
  return orderPlaced;
}
