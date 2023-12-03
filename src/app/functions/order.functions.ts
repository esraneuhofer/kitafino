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
  OrderSubDetailNew
} from "../classes/order_student.class";
import * as moment from 'moment-timezone';

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
    orderStudent.order.orderMenus.forEach((eachOrder, indexMenu) => {
      let indexMenuFound = getIndexMenu(orderNew.order.orderMenus,eachOrder.idType);
      if(indexMenuFound < 0)return;
      // orderNew.order.orderMenus[indexMenu].displayMenu = displayMenuForStudent(eachOrder.typeOrder, settings);
      orderNew.order.orderMenus[indexMenuFound].amountOrder = eachOrder.amountOrder;
    })
    orderStudent.order.specialFoodOrder.forEach((eachOrder, indexMenu) => {
      orderNew.order.specialFoodOrder[indexMenu].amountSpecialFood = eachOrder.amountSpecialFood;
    })
  }
  return orderNew;
}

function getPriceOrder():number {
  return 3.7;
}

export function modifyOrderModelForSave(copy: OrderInterfaceStudent): OrderInterfaceStudentSave {
  let newObject: OrderInterfaceStudentSave = {
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
        priceOrder: getPriceOrder()
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
        priceOrder: getPriceOrder(),
        nameSpecialFood: eachOrder.nameSpecialFood
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
