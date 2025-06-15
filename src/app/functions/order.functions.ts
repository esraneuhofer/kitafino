import {
  OrderInterfaceStudentSave,
  SpecialFoodOrderInterfaceSafe
} from "../classes/order_student_safe.class";
import { WeekplanMenuInterface } from "../classes/weekplan.interface";
import { SettingInterfaceNew } from "../classes/setting.class";
import { CustomerInterface } from "../classes/customer.class";
import { StudentInterface } from "../classes/student.class";
import {
  OrderClassStudent,
  OrderInterfaceStudent,
  OrderSubDetailNew, SpecialFoodOrderInterface
} from "../classes/order_student.class";
import { DisplayOrderArrayIntrface } from "../home/dashboard/dashboard.component";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import { normalizeToBerlinDate } from "./date.functions";
import { EinrichtungInterface } from "../classes/einrichtung.class";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);


function getIndexMenu(orderMenus: OrderSubDetailNew[], idType: string): number {
  for (let i = 0; i < orderMenus.length; i++) {
    if (orderMenus[i].idType === idType) {
      return i;
    }
  }
  return -1;
}

export function setOrderStudent(orderStudent: (OrderInterfaceStudentSave | null),
  weekplanSelectedWeek: WeekplanMenuInterface,
  settings: SettingInterfaceNew,
  customer: CustomerInterface,
  selectedStudent: StudentInterface | null,
  indexDaySelected: number,
  dateChange: string, // Format: 'YYYY-MM-DD'
  query: { week: number, year: number },
  contractSettings: EinrichtungInterface): OrderInterfaceStudent {
  console.log(dateChange)
  let orderNew = new OrderClassStudent(customer, query, settings, weekplanSelectedWeek.weekplan[indexDaySelected], selectedStudent, dateChange, contractSettings);
  console.log(orderNew.dateOrder);
  if (orderStudent) {
    orderNew._id = orderStudent._id;
    orderNew.orderId = orderStudent.orderId;
    orderNew.userId = orderStudent.userId;
    orderNew.isBut = orderStudent.isBut;
    orderStudent.order.orderMenus.forEach((eachOrder, indexMenu) => {

      let indexMenuFound = getIndexMenu(orderNew.order.orderMenus, eachOrder.idType);
      if (indexMenuFound < 0) return;
      // orderNew.order.orderMenus[indexMenu].displayMenu = displayMenuForStudent(eachOrder.typeOrder, settings);
      orderNew.order.orderMenus[indexMenuFound].amountOrder = eachOrder.amountOrder;
      orderNew.order.orderMenus[indexMenuFound].menuSelected = eachOrder.menuSelected;
      orderNew.order.orderMenus[indexMenuFound].priceOrder = eachOrder.priceOrder;
    })
  }
  return orderNew;
}



export function modifyOrderModelForSave(copy: OrderInterfaceStudent): OrderInterfaceStudentSave {
  let newObject: OrderInterfaceStudentSave = {
    orderId: copy.orderId || '',
    studentId: copy.studentId || '',
    kw: copy.kw,
    year: copy.year,
    subgroup: '',
    dateOrder: normalizeToBerlinDate(copy.dateOrder),
    customerId: copy.customerId,
    order: {
      comment: copy.order.comment,
      orderMenus: [],
      specialFoodOrder: []
    },
    isBut: copy.isBut
  }
  if (copy.order && Array.isArray(copy.order.orderMenus)) {
    copy.order.orderMenus.forEach((eachOrder) => {
      if (eachOrder.amountOrder === 0) return;
      let newObjectPre = {
        typeOrder: eachOrder.typeOrder,
        nameOrder: eachOrder.nameOrder,
        idType: eachOrder.idType,
        amountOrder: eachOrder.amountOrder,
        idMenu: eachOrder.idMenu,
        priceOrder: eachOrder.priceOrder,
        menuSelected: eachOrder.menuSelected
      }
      newObject.order.orderMenus.push(newObjectPre);
    });
  }

  return newObject;
}


// Backend: Berechnung des Montags in deutscher Zeit
export function getDateMondayFromCalenderweek(dateQuery: { week: number, year: number }): Date {

  const jan4 = dayjs.tz(`${dateQuery.year}-01-04`, 'Europe/Berlin');
  const firstMondayOfYear = jan4.startOf('isoWeek');
  const targetMonday = firstMondayOfYear.add(dateQuery.week - 1, 'week');

  // Setze die Zeit auf den Anfang des Tages (00:00 Berliner Zeit)
  return targetMonday.startOf('day').toDate();
}

export function formatDateToISO(date: Date): string {
  // Konvertiere zu Berliner Zeit für konsistente ISO-Formatierung
  const berlinDate = dayjs.tz(date, 'Europe/Berlin');

  // Format: YYYY-MM-DDTHH:mm:ss+02:00 (oder +01:00 je nach Sommerzeit)
  return berlinDate.format();
}


export function orderIsEmpty(order: OrderInterfaceStudent): boolean {
  let boolean = true;
  order.order.orderMenus.forEach((eachOrder) => {
    if (eachOrder.amountOrder > 0) boolean = false;
  })
  return boolean;
}
export function orderIsNegative(order: OrderInterfaceStudent): boolean {
  let boolean = false;
  order.order.orderMenus.forEach((eachOrder) => {
    if (eachOrder.amountOrder < 0) boolean = true;
  })
  return boolean;
}

export function customerHasSpecialVisibleEmail(specialFood: SpecialFoodOrderInterface, customerInfo: CustomerInterface) {
  let show = false;
  customerInfo.order.specialShow.forEach((specialFoodCustomer) => {
    if (specialFoodCustomer.idSpecialFood === specialFood.idSpecialFood && specialFoodCustomer.selected) {
      show = true;
    }
  });
  return show;
}

export function getTotalPortion(order: OrderInterfaceStudent): number {
  let number = 0;
  order.order.orderMenus.forEach((eachOrder) => {
    number += eachOrder.amountOrder;
  })

  return number;
}

export function sortOrdersByDate(orders: DisplayOrderArrayIntrface[]) {
  return orders.sort((a, b) => {
    // Konsistente Datums-Interpretation in Berliner Zeit
    const dateA = dayjs.tz(a.dateOrder, 'Europe/Berlin').valueOf();
    const dateB = dayjs.tz(b.dateOrder, 'Europe/Berlin').valueOf();
    return dateA - dateB;
  });
}


