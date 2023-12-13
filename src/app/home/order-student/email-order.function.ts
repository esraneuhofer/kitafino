import {OrderInterfaceStudent, OrderSubDetailNew} from "../../classes/order_student.class";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {getInvoiceDateOne, getTimeToDisplay} from "../../functions/date.functions";
import {CustomerInterface} from "../../classes/customer.class";
import {customerHasSpecialVisibleEmail, getTotalPortion} from "../../functions/order.functions";
import {MealtypesWeekplan, WeekplanDayInterface} from "../../classes/weekplan.interface";
import {getBodyEmailGenerell} from "./email-generell.functions";

export interface EmailOrderInterface {
  orderStudent: OrderInterfaceStudent,
  settings: SettingInterfaceNew,
  tenantStudent: TenantStudentInterface,
  typeOrder: string,
  customerInfo: CustomerInterface,
  weekplanDay:WeekplanDayInterface,
  sendCopyEmail:boolean
}

export function getEmailBody(objectData: EmailOrderInterface): any {
  let titleOrder = 'Bestellung';
  let typeOrder = 'Bestellung'
  const orderTime = getTimeToDisplay();
  let arrayEmail = [objectData.settings.orderSettings.confirmationEmail];
  if(objectData.sendCopyEmail){
    arrayEmail.push(objectData.tenantStudent.email)
  }
  const emailBody = getEmailBodyHtml(objectData, 'order');
  if (objectData.typeOrder === 'edit') {
    // obj.orderForEmail = obj.orderForEmailEdit;
    titleOrder = 'Änderung';
    typeOrder = 'Änderung';
    // editedBody = getEmailBody(obj, startDay, endDay, 'edit');
  }
  let email = getBodyEmailGenerell(objectData,arrayEmail, titleOrder, typeOrder, orderTime, emailBody);
  return email;
}

function getEmailBodyHtml(objectData: EmailOrderInterface, typeOrder: string): any {
  let tableModel = '';

  // if (type !== 'order') {
  //   tableModel += '<table style="margin-top: 8px" class="table_calender_week table table-bordered">\n' +
  //     '          <tr style="background-color:#f7ce50">\n' +
  //     '            <th colspan="100%">Zahlen der ursprünglichen Bestellung</b></th></tr>' +
  //     '</th>\n' +
  //     '          </tr>\n' +
  //     '        </table>';
  // }
  if (typeOrder === 'order') {
    tableModel += tableModel += '  <table class="table_calender_week table table-bordered">\n' +
      '          <tr>\n' +
      '            <th colspan="100%">' +
      '<b>' + getInvoiceDateOne(objectData.orderStudent.dateOrder) + '</b></th></tr>' +
      '</th>\n' +
      '          </tr>\n' +
      '        </table>';
  }
  tableModel += getTableContent(objectData) +
    // getTotalContent(obj) +
    // getMenuContent(obj) +
    // getCommentContent(orderStudent,settings) +
    '</table>';
  return tableModel;
}

function getTableContent(object: EmailOrderInterface): any {
  let table = ' <table class="table table-bordered">';
    object.orderStudent.order.orderMenus.forEach((eachOrderDay, indexGroup) => {
      if (object.settings.orderSettings.hideEmptyOrderEmail && eachOrderDay.amountOrder === 0) {
        return;
      }
      if (eachOrderDay.typeOrder === 'menu' || eachOrderDay.typeOrder === 'special' ||
        (eachOrderDay.typeOrder === 'side' && object.settings.orderSettings.sideOrderSeparate) ||
        (eachOrderDay.typeOrder === 'dessert' && object.settings.orderSettings.dessertOrderSeparate)) {
        let background = getBackGroundColor(eachOrderDay.typeOrder);
        table += '<tr style="background: ' + background + ';">' +
          '<td>' + getMenuName(object,eachOrderDay) + '</td>' +
          '<td>' + eachOrderDay.amountOrder + '</td>' +
          '</tr>';
      }
    });
  // if (!hideSpecialFoodIfNoMenuShown(eachGroup.order, obj.settings.orderSettings.showMenuWithoutName)) {
  object.orderStudent.order.specialFoodOrder.forEach(eachSpecialFood => {
    if (object.settings.orderSettings.hideEmptyOrderEmail && eachSpecialFood.amountSpecialFood === 0) {
      return;
    }
    if (customerHasSpecialVisibleEmail(eachSpecialFood, object.customerInfo) && eachSpecialFood.amountSpecialFood > 0 || eachSpecialFood.active) {
      table += ' <tr style="background: #8693E0">\n' +
        '            <td >' + eachSpecialFood.nameSpecialFood + '</td>\n' +
        '            <td>' + eachSpecialFood.amountSpecialFood + '</td>\n' +
        '          </tr>';
    }
  });
  // }

  table += ' <tr style="background: #D3D3D3">\n' +
    '            <td >Gesamt</td>\n' +
    '            <td>' + getTotalPortion(object.orderStudent) + '</td>\n' +
    '          </tr>';

  return table;
}

function getBackGroundColor(typeOrder: string) {
  if (typeOrder === 'menu') {
    return '#8693E0';
  }
  if (typeOrder === 'side') {
    return '#AEE5B5';
  }
  if (typeOrder === 'dessert') {
    return '#FFF7E0';
  }
  if (typeOrder === 'special') {
    return '#D8B3E9';
  }
  return '#8693E0';
}

function getMenuName(object: EmailOrderInterface,eachOrderDay:OrderSubDetailNew) {
  let components = [];
  let side = null;
  let name = null;
  let dessert = null;
  if (object.settings.orderSettings.showSideIfNotSeparate && object.customerInfo.order.sidedish) {
    side = getSideOrdDessertNameIfExist(object.weekplanDay.mealTypesDay, 'side');
  }
  if (side) { // Only add to components if side is not null
    components.push(side);
  }

  name = eachOrderDay.nameOrder;
  if (name) { // Only add to components if name is not null
    components.push(name);
  }

  if (object.settings.orderSettings.showDessertIfNotSeparate && object.customerInfo.order.dessert) {
    dessert = getSideOrdDessertNameIfExist(object.weekplanDay.mealTypesDay, 'dessert');
  }
  if (dessert) { // Only add to components if dessert is not null
    components.push(dessert);
  }

  return components.join(' , ');
}


function getSideOrdDessertNameIfExist(menuDay: MealtypesWeekplan[], type: string) {
  let name = '';
  menuDay.forEach(eachMenu => {
    if (eachMenu.typeSpecial === type) {
      if(!eachMenu.menu)return
      name += eachMenu.menu.nameMenu;
    }
  });
  return name;
}
