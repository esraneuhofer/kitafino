const {addDayFromDate, getInvoiceDateOne, getTimeToDisplay} = require('./date.functions');
const {getMenuName,customerHasSpecialVisibleEmail} = require('./deadline-email.functions');
const {getTotalPortion,getTotalPortionsDay,getDisplayName} = require('./order-model.functions');
const {getToArray} = require('./email-order-customer');
function getOrderBody(obj) {
  // console.log('obj', obj.orderForEmail);
  let eDay = addDayFromDate(obj.startDay, 4);
  let startDay = getInvoiceDateOne(obj.startDay);
  let endDay = getInvoiceDateOne(eDay);
  const emailBody = getEmailBody(obj, startDay, endDay, '#0b58a2');
  let headerEdit = '';
  let emailArray = getToArray(obj.settings.orderSettings.confirmationEmail, obj.customerInfo);

  const titleOrder = 'Vielen Dank für Ihre Bestellung';
  const typeOrder = 'Bestellung';

  var orderTime = getTimeToDisplay();
  let email = {
    from: obj.settings.tenantSettings.contact.companyName + '<noreply@cateringexpert.de>', // sender address
    replyTo: obj.settings.orderSettings.confirmationEmail,
    to: emailArray, // list of receivers
    subject: 'Bestellbestätigung✔', // Subject line
    html: '<div style="font-size:1.3em;width: 100vm;height: 100vh;padding:50px 75px 50px 75px; background:#EDEDED">' +
      '<div style="background:white; border:1px solid lightgray; padding:50px">' +
      '<h5>' + titleOrder + '</h5>' +
      emailBody +
      headerEdit +
      '<div style="margin-top: 15px;font-size:0.7em;">Datum:' + orderTime + ' | ' + typeOrder + ' von Caterer aufgegeben</div>' +
      '</div>' +
      '</div>'
  };
  return email;
}

function getEmailBody(obj, startDay, endDay, color) {
  return '<table style="border-collapse: collapse;width: 100%">' +
    '<tr> <th colspan="100%" style="text-align:center;border:1px solid #ddd;padding:8px">' +
    'Kalenderwoche: <b>' + obj.orderOverview.queryCW + '</b>  |  <b>' + startDay + '</b> - <b>' + endDay + '</b></th></tr>' +
    '<tr>' +
    '<th style="width: 25%;padding-top:12px;padding-bottom: 12px;text-align: left;background-color:' + color + ';color: white;border:1px solid #ddd;"></th>' +
    '<th style="width: 15%;padding-top:12px;padding-bottom: 12px;text-align: center;background-color:' + color + ';color: white;border:1px solid #ddd;"><span>Montag</span></th>' +
    '<th style="width: 15%;padding-top:12px;padding-bottom: 12px;text-align: center;background-color:' + color + ';color: white;border:1px solid #ddd;"><apn>Dienstag</apn></th>' +
    '<th style="width: 15%;padding-top:12px;padding-bottom: 12px;text-align: center;background-color:' + color + ';color: white;border:1px solid #ddd;"><span>Mittwoch</span></th>' +
    '<th style="width: 15%;padding-top:12px;padding-bottom: 12px;text-align: center;background-color:' + color + ';color: white;border:1px solid #ddd;"><span>Donnerstag</span></th>' +
    '<th style="width: 15%;padding-top:12px;padding-bottom: 12px;text-align: center;background-color:' + color + ';color: white;border:1px solid #ddd;"><span>Freitag</span></th>' +
    '</tr>' +
    getTableContent(obj) +
    getTotalContent(obj) +
    // getMenuContent(obj) +
    getCommentContent(obj) +
    '</table>';
}


function hideSpecialFoodIfNoMenuShown(order, showMenuWithoutName) {
  if (showMenuWithoutName) {
    return false;
  }
  let allNotShown = true;
  order.forEach(eachOrderDay => {
    if (!eachOrderDay.isDisabled || eachOrderDay.amountOrder > 0) {
      allNotShown = false;
    }
  })
  return allNotShown;
}

function checkIfSideOrDessertSeperate(obj, eachOrderDay) {
  if (obj.settings.orderSettings.showSideIfNotSeparate && eachOrderDay.typeOrder === 'side') return true;
  if (obj.settings.orderSettings.showDessertIfNotSeparate && eachOrderDay.typeOrder === 'dessert') return true;
  if (obj.settings.orderSettings.sideOrDessertChoose && eachOrderDay.typeOrder === 'side' ||
    obj.settings.orderSettings.sideOrDessertChoose && eachOrderDay.typeOrder === 'dessert') return true;
  return false;
}

function getEachTableCell(obj, index, indexDay) {
  let cell = '';
  obj.orderForEmail[indexDay].orderDayGroups[index].order.forEach((eachOrderDay, indexEachOrderDay) => {
    if (obj.settings.orderSettings.hideEmptyOrderEmail && eachOrderDay.amountOrder === 0) return
    if (checkIfSideOrDessertSeperate(obj, eachOrderDay)) return;
    cell += '<span>' + getMenuName(obj, indexDay, eachOrderDay) + ': ' + '<b>' + eachOrderDay.amountOrder + '</b></span><br>';
    if (obj.settings.orderSettings.specialShowPerMeal) {
      if (eachOrderDay.amountOrder === 0) return;
      eachOrderDay.specialFoodOrder.forEach(eachOrderSpecialFood => {
        if (eachOrderSpecialFood.amountSpecialFood > 0) {
          cell += '<span>' + eachOrderDay.nameOrder + ' | ' + eachOrderSpecialFood.nameSpecialFood + ': ' + '<b>' + eachOrderSpecialFood.amountSpecialFood + '</b></span><br>';
        }
      })
    }
    // }
    // if (obj.settings.orderSettings.specialShowPerMeal) {
    //   eachOrderDay.specialFoodOrder.forEach(eachSpecialFood => {
    //     if(customerHasSpecialVisibleEmail(eachSpecialFood, obj.customerInfo) && eachSpecialFood.amountSpecialFood > 0 || eachSpecialFood.active){
    //       cell += '<span>' + eachOrderDay.nameOrder + ' | ' + eachSpecialFood.nameSpecialFood + ': ' + eachSpecialFood.amountSpecialFood + '</span><br>';
    //     }
    //   });
    // }
  });
  if (!obj.settings.orderSettings.specialShowPerMeal) {
    if (!hideSpecialFoodIfNoMenuShown(obj.orderForEmail[indexDay].orderDayGroups[index].order, obj.settings.orderSettings.showMenuWithoutName)) {
      obj.orderForEmail[indexDay].orderDayGroups[index].specialFoodOrder.forEach(eachSpecialFood => {
        if (obj.settings.orderSettings.hideEmptyOrderEmail && eachSpecialFood.amountSpecialFood === 0) return
        if (customerHasSpecialVisibleEmail(eachSpecialFood, obj.customerInfo) && eachSpecialFood.amountSpecialFood > 0 || eachSpecialFood.active) {
          cell += '<span>' + eachSpecialFood.nameSpecialFood + ': ' + '<b>' + eachSpecialFood.amountSpecialFood + '</b></span><br>';
        }
      })
    }
  }
  cell += '<b><u><span>Gesamt Menu:' + getTotalPortion(obj.orderForEmail[indexDay].orderDayGroups[index], obj.settings) + '</span></u></b><br>';
  return cell;
}

function getLineEachSplit(indexGroup, obj) {
  var tableLine = '<td style="border:1px solid #ddd;padding:8px">' + getDisplayName(obj.orderForEmail[0].orderDayGroups[indexGroup].groupId, obj.customerInfo) + '</td>';
  obj.orderForEmail.forEach((eachOrder, indexDay) => {
    tableLine += '<td style="border:1px solid #ddd;padding:8px;vertical-align: top;">' + getEachTableCell(obj, indexGroup, indexDay) + '</td>';

  });
  return '<tr>' + tableLine + '</tr>';
}

function getTableContent(obj) {
  var tableRow = '';
  obj.orderForEmail[0].orderDayGroups.forEach((eachGroup, indexGroup) => {
    tableRow += (getLineEachSplit(indexGroup, obj));
  });
  return tableRow;
}

function getCommentContent(obj) {
  var tableLine = '<td style="border:1px solid #ddd;padding:8px">Kommnentar</td>';
  obj.orderForEmail.forEach(eachOrder => {
    if (!eachOrder || !eachOrder.comment || emptyObj(eachOrder)) {
      tableLine += '<td style="border:1px solid #ddd;padding:8px"></td>';
    } else {
      tableLine += '<td style="border:1px solid #ddd;padding:8px">' + eachOrder.comment + '</td>';
    }
  });
  return '<tr>' + tableLine + '</tr>';
}

function getTotalContent(obj) {
  var tableLine = '<td style="border:1px solid #ddd;padding:8px">Gesamt Menu</td>';
  obj.orderForEmail.forEach(eachOrder => {
    tableLine += '<td style="border:1px solid #ddd;padding:8px;text-align: left">' + getTotalPortionsDay(eachOrder.orderDayGroups, obj.settings) + '</td>';
  });
  return '<tr>' + tableLine + '</tr>';
}


module.exports = {getOrderBody}
