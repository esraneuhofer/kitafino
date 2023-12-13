import {
  OrderInterfaceStudentSave,
  OrderSubDetailNewSafe,
  SpecialFoodOrderInterfaceSafe
} from "../classes/order_student_safe.class";
import {WeekplanMenuInterface} from "../classes/weekplan.interface";
import {SettingInterfaceNew} from "../classes/setting.class";
import {CustomerInterface} from "../classes/customer.class";
import {StudentInterface} from "../classes/student.class";
import {
  OrderClassStudent,
  OrderInterfaceStudent,
  OrderSubDetailNew, SpecialFoodOrderInterface
} from "../classes/order_student.class";
import * as moment from 'moment-timezone';
import {DisplayOrderArrayIntrface} from "../home/dashboard/dashboard.component";

function getIndexMenu(orderMenus:OrderSubDetailNew[], idType: string): number {
  for (let i = 0; i < orderMenus.length; i++) {
    if (orderMenus[i].idType === idType) {
      return i;
    }
  }
  return -1;
}

export function setOrderStudent(orderStudent:(OrderInterfaceStudentSave | null),
                         weekplanSelectedWeek:WeekplanMenuInterface,
                         settings:SettingInterfaceNew,
                         customer:CustomerInterface,
                         selectedStudent:StudentInterface | null,
                         indexDaySelected:number,
                         dateChange:string,
                         query:{week:number, year:number}):OrderInterfaceStudent{
  let orderNew = new OrderClassStudent(customer, query, settings, weekplanSelectedWeek.weekplan[indexDaySelected], selectedStudent, new Date(dateChange));
  if (orderStudent) {
    orderNew._id = orderStudent._id;
    orderNew.orderId = orderStudent.orderId;
    orderStudent.order.orderMenus.forEach((eachOrder, indexMenu) => {
      let indexMenuFound = getIndexMenu(orderNew.order.orderMenus,eachOrder.idType);
      if(indexMenuFound < 0)return;
      // orderNew.order.orderMenus[indexMenu].displayMenu = displayMenuForStudent(eachOrder.typeOrder, settings);
      orderNew.order.orderMenus[indexMenuFound].amountOrder = eachOrder.amountOrder;
      orderNew.order.orderMenus[indexMenuFound].menuSelected = eachOrder.menuSelected;
    })
    orderStudent.order.specialFoodOrder.forEach((eachOrder, indexMenu) => {
      orderNew.order.specialFoodOrder[indexMenu].amountSpecialFood = eachOrder.amountSpecialFood;
      orderNew.order.orderMenus[indexMenu].menuSelected = eachOrder.menuSelected;
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
    dateOrder: moment.tz(copy.dateOrder, 'Europe/Berlin').format(),
    customerId: copy.customerId,
    order: {
      comment: copy.order.comment,
      orderMenus: [],
      specialFoodOrder: []
    }
  }
  if (copy.order && Array.isArray(copy.order.orderMenus)) {
    copy.order.orderMenus.forEach((eachOrder) => {
      if(eachOrder.amountOrder === 0 )return;
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
  if (copy.order && Array.isArray(copy.order.specialFoodOrder)) {
    copy.order.specialFoodOrder.forEach((eachOrder) => {
      if(eachOrder.amountSpecialFood === 0 )return;
      let newObjectSafe: SpecialFoodOrderInterfaceSafe = {
        idSpecialFood: eachOrder.idSpecialFood,
        amountSpecialFood: eachOrder.amountSpecialFood,
        priceOrder: eachOrder.priceOrder,
        nameSpecialFood: eachOrder.nameSpecialFood,
        menuSelected: eachOrder.menuSelected
      }
      newObject.order.specialFoodOrder?.push(newObjectSafe);
    });
  }
  return newObject;
}

export function getLockedStatus(pastOrder: boolean, lockDay: boolean): boolean {
  if (pastOrder || lockDay) {
    return true;
  }
  return false;
}

export function getDateMondayFromCalenderweek(dateQuery: { week: number, year: number }): Date {
  let simple = new Date(dateQuery.year, 0, 1 + (dateQuery.week - 1) * 7);
  let dow = simple.getDay();
  let ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}


export function orderIsEmpty(order: OrderInterfaceStudent): boolean {
  let boolean = true;
  order.order.orderMenus.forEach((eachOrder) => {
    if(eachOrder.amountOrder > 0)boolean = false;
  })
  order.order.specialFoodOrder.forEach((eachOrder) => {
    if(eachOrder.amountSpecialFood > 0)boolean = false;

  })
  return boolean;
}
export function orderIsNegative(order: OrderInterfaceStudent): boolean {
  let boolean = false;
  order.order.orderMenus.forEach((eachOrder) => {
    if(eachOrder.amountOrder < 0)boolean = true;
  })
  order.order.specialFoodOrder.forEach((eachOrder) => {
    if(eachOrder.amountSpecialFood < 0)boolean = true;

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
  order.order.specialFoodOrder.forEach((eachOrder) => {
    number += eachOrder.amountSpecialFood;
  })
  return number;
}

export function sortOrdersByDate(orders:DisplayOrderArrayIntrface[]) {
  return orders.sort((a, b) => {
    const dateA = new Date(a.dateOrder).getTime();
    const dateB = new Date(b.dateOrder).getTime();
    return dateA - dateB;
  });
}
