const fiveDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];


const {getTotalPortion,getTotalPortionsDay,getDisplayName, hideSpecialFoodIfNoMenuShown} = require('./order-model.functions');
const {addDayFromDate, getInvoiceDateOne, getTimeToDisplay} = require('./date.functions');

function getOrderBodyNew(obj) {
  var titleOrder;
  var typeOrder;
  let eDay = addDayFromDate(obj.startDay, 4);
  let startDay = getInvoiceDateOne(obj.startDay);
  let endDay = getInvoiceDateOne(eDay);

  const emailBody = getEmailBody(obj, startDay, endDay, 'order');

  var editedBody= '';
  let emailArray = [obj.settings.orderSettings.confirmationEmail];
  if (obj.sendEmailCustomer) {
    emailArray.push(obj.customerInfo.contact.email);
  }
    titleOrder = 'Vielen Dank für Ihre Bestellung';
    typeOrder = 'Bestellung';

  var orderTime = getTimeToDisplay();
  let email = {
    from: obj.settings.tenantSettings.contact.companyName + '<noreply@cateringexpert.de>', // sender address
    replyTo: obj.settings.orderSettings.confirmationEmail,
    to: [emailArray], // list of receivers
    bcc:'eltern_bestellung@cateringexpert.de',
    subject: 'Bestellbestätigung✔', // Subject line
    html: '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <style>\n' +
      'table{\n' +
      '  border: 2px solid lightgray;\n' +
      '}\n' +
      '.container {\n' +
      '  max-width: 650px; /* or whatever maximum width you want */\n' +
      '  margin: 25px auto;\n' +
      '  padding: 0 15px; /* Some padding to ensure content doesn\'t touch the edges on small screens */\n' +
      '}\n' +
      '\n' +
      '.row {\n' +
      '  display: flex;\n' +
      '  flex-wrap: wrap; /* Allows columns to wrap on smaller screens */\n' +
      '  margin-left: -15px;\n' +
      '  margin-right: -15px;\n' +
      '}\n' +
      '\n' +
      '.col-10, .offset-1 {\n' +
      '  flex-basis: 0;\n' +
      '  flex-grow: 1;\n' +
      '  max-width: 100%;\n' +
      '  padding-left: 15px;\n' +
      '  padding-right: 15px;\n' +
      '}\n' +
      '\n' +
      '.col-10 {\n' +
      '  flex: 0 0 83.33333%; /* 10/12 = 83.33333% */\n' +
      '}\n' +
      '\n' +
      '.offset-1 {\n' +
      '  margin-left: 8.33333%; /* 1/12 = 8.33333% */\n' +
      '}\n' +
      '/* Border for the entire table */\n' +
      '.table-bordered {\n' +
      '  border: 1px solid #dee2e6;\n' +
      '}\n' +
      '\n' +
      '/* Borders for the table cells */\n' +
      '.table-bordered th,\n' +
      '.table-bordered td {\n' +
      '  border: 1px solid black;\n' +
      '  border-collapse: collapse;\n' +
      '}\n' +
      '\n' +
      '/* For tables that have a <tbody>, <thead>, or <tfoot> element */\n' +
      '.table-bordered thead th,\n' +
      '.table-bordered thead td {\n' +
      '  border-bottom-width: 2px;\n' +
      '}\n' +
      '\n' +
      '.table_calender_week{\n' +
      '  text-align: center;\n' +
      '  margin-bottom: 10px;\n' +
      '}\n' +
      '\n' +
      '.table {\n' +
      '  width: 100%;\n' +
      '  border-collapse: collapse;\n' +
      '}\n' +
      '.date_day{\n' +
      '  background-color: white;\n' +
      '  text-align: center;\n' +
      '}\n' +
      '.groupName{\n' +
      '  background-color: #B2C9F0;\n' +
      '  text-align: center;\n' +
      '}\n' +
      'th{\n' +
      '  padding: 5px;\n' +
      '}\n' +
      'td{\n' +
      '  padding: 5px;\n' +
      '}\n' +
      'tr td:first-child {\n' +
      '  width: 70%;\n' +
      '}\n' +
      '\n' +
      'tr td:last-child {\n' +
      '  width: 30%;\n' +
      '}\n' +
      '  </style>\n' +
      '</head><body>' +
      '<div style="font-size:1.3em;width: 100vm;height: 100vh;padding:50px 75px 50px 75px; background:#EDEDED">' +

      '<div class="container">\n' +
      '<div style="background:white; border:1px solid lightgray; padding:50px">' +
      '<h4>' + titleOrder + '</h4>' +
      '  <div class="row">\n' +
      '    <div class="col-10 offset-1">' +
      emailBody +
      editedBody +
      '<div style="margin-top: 15px;font-size:0.7em;">Datum:' + orderTime + ' | ' + typeOrder + ' vom Kunden aufgegeben</div>' +
      '</div>' +
      '</div>' +
      '    </div>\n' +
      '    </div>\n' +
      '  </div>' +
      '</body>'
  };
  return email;
}

function getCommentContent(obj) {
  let startDay = obj.startDay;
  let table = '<table style="margin-top: 8px; width: 100%; background-color: #efefef;" class="table table-bordered">\n' +
    '          <tr style="text-align: center">\n' +
    '            <th colspan="3">Übersicht Bestellung</th>' +
    '</tr>\n' +
    '          <tr style="text-align: left">\n' +
    '            <th style="width: 30%;">Tag</th>\n' +
    '            <th style="width: 20%;">Gesamt Tag</th>\n' +
    '            <th style="width: 50%;">Kommentar</th>\n' +
    '</tr>\n';

  obj.orderForEmail.forEach((eachOrder, indexDay) => {
    let comment = eachOrder.comment || '';
    table += '<tr style="text-align: left">\n' +
      '<td style="width: 30%;">' + getInvoiceDateOne(addDayFromDate(startDay, indexDay)) + '</td>\n' +
      '<td style="width: 20%;">' + getTotalPortionsDay(obj.orderForEmail[indexDay].orderDayGroups, obj.settings) + '</td>\n' +
      '<td style="width: 50%;">' + comment + '</td>\n' +
      '</tr>\n';
  });
  return table + '</table>';
}


function getEmailBody(obj, startDay, endDay, type) {
  let tableModel = '';

  if (type !== 'order') {
    tableModel += '<table style="margin-top: 8px" class="table_calender_week table table-bordered">\n' +
      '          <tr style="background-color:#f7ce50">\n' +
      '            <th colspan="100%">Zahlen der ursprünglichen Bestellung</b></th></tr>' +
      '</th>\n' +
      '          </tr>\n' +
      '        </table>';
  }
  if (type === 'order') {
    tableModel += tableModel += '  <table class="table_calender_week table table-bordered">\n' +
      '          <tr>\n' +
      '            <th colspan="100%">' +
      'Kalenderwoche: <b>' + obj.orderOverview.queryCW + '</b>  |  <b>' + startDay + '</b> - <b>' + endDay + '</b></th></tr>' +
      '</th>\n' +
      '          </tr>\n' +
      '        </table>';
  }
  tableModel += getTableContent(obj) +
    // getTotalContent(obj) +
    // getMenuContent(obj) +
    getCommentContent(obj) +
    '</table>';
  return tableModel;
}

function getBackGroundColor(typeOrder) {
  return '#8693E0';
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
}


function getSideOrdDessertNameIfExist(menuDay, type) {
  let name = '';
  menuDay.forEach(eachMenu => {
    if (eachMenu.typeSpecial === type) {
      if(!eachMenu.menu)return
      name += eachMenu.menu.nameMenu;
    }
  });
  return name;
}

function getMenuName(obj, indexDay, eachOrderDay) {
  let components = [];
  let side = null;
  let name = null;
  let dessert = null;
  if (obj.settings.orderSettings.showSideIfNotSeparate && obj.customerInfo.order.sidedish) {
    side = getSideOrdDessertNameIfExist(obj.weekplanSelectedWeek.weekplan[indexDay].mealTypesDay, 'side');
  }
  if (side) { // Only add to components if side is not null
    components.push(side);
  }

  name = eachOrderDay.nameOrder;
  if (name) { // Only add to components if name is not null
    components.push(name);
  }

  if (obj.settings.orderSettings.showDessertIfNotSeparate && obj.customerInfo.order.dessert) {
    dessert = getSideOrdDessertNameIfExist(obj.weekplanSelectedWeek.weekplan[indexDay].mealTypesDay, 'dessert');
  }
  if (dessert) { // Only add to components if dessert is not null
    components.push(dessert);
  }

  // Join the components with a comma and a space, only if they exist.
  return components.join(' , ');
}

function getTableContent(obj) {
  let tableContent = '';
  let date = obj.startDay;
  fiveDays.forEach((eachDay, indexDay) => {
    let tableDayContent = '';
    let table = ' <table class="table table-bordered"> <tr style="background:#ffc7b6">\n' +
      '            <th colspan="100%">' + fiveDays[indexDay] + '  ' + getInvoiceDateOne(addDayFromDate(date, indexDay)) + '</th>\n' +
      '          </tr>';
    obj.orderForEmail[indexDay].orderDayGroups.forEach((eachGroup, indexGroup) => {
      table += ' <table class="table table-bordered"> <tr class="groupName">\n' +
        '            <th colspan="100%">'  + getDisplayName(eachGroup.groupId, obj.customerInfo) + '</th>\n' +
        '          </tr>';
      eachGroup.order.forEach((eachOrderDay, indexOrder) => {
        if (obj.settings.orderSettings.hideEmptyOrderEmail && eachOrderDay.amountOrder === 0) {
          return;
        }
        if(eachOrderDay.typeOrder === 'menu' || eachOrderDay.typeOrder === 'special' ||
          (eachOrderDay.typeOrder === 'side' && obj.settings.orderSettings.sideOrderSeparate) ||
          (eachOrderDay.typeOrder === 'dessert' && obj.settings.orderSettings.dessertOrderSeparate)){
          let background = getBackGroundColor(eachOrderDay.typeOrder);
          table += '<tr style="background: ' + background + ';">' +
            '<td>' + getMenuName(obj, indexDay, eachOrderDay) + '</td>' +
            '<td>' + eachOrderDay.amountOrder + '</td>' +
            '</tr>';
        }
        if(obj.settings.orderSettings.specialShowPerMeal && eachOrderDay.typeOrder === 'menu'){

          if (!hideSpecialFoodIfNoMenuShown(eachGroup.order, obj.settings.orderSettings.showMenuWithoutName)) {
            eachOrderDay.specialFoodOrder.forEach(eachSpecialFood => {
              if (obj.settings.orderSettings.hideEmptyOrderEmail && eachSpecialFood.amountSpecialFood === 0) {
                return;
              }
              if (customerHasSpecialVisibleEmail(eachSpecialFood, obj.customerInfo) && eachSpecialFood.amountSpecialFood > 0 || eachSpecialFood.active) {
                table += ' <tr style="background: #8693E0">\n' +
                  '            <td >' + getMenuName(obj, indexDay, eachOrderDay)   +  ' | ' + eachSpecialFood.nameSpecialFood + '</td>\n' +
                  '            <td>' + eachSpecialFood.amountSpecialFood + '</td>\n' +
                  '          </tr>';
              }
            });
          }
        }



      });
      if(!obj.settings.orderSettings.specialShowPerMeal){
        if (!hideSpecialFoodIfNoMenuShown(eachGroup.order, obj.settings.orderSettings.showMenuWithoutName)) {
          eachGroup.specialFoodOrder.forEach(eachSpecialFood => {
            if (obj.settings.orderSettings.hideEmptyOrderEmail && eachSpecialFood.amountSpecialFood === 0) {
              return;
            }
            if (customerHasSpecialVisibleEmail(eachSpecialFood, obj.customerInfo) && eachSpecialFood.amountSpecialFood > 0 || eachSpecialFood.active) {
              table += ' <tr style="background: #8693E0">\n' +
                '            <td >' + eachSpecialFood.nameSpecialFood + '</td>\n' +
                '            <td>' + eachSpecialFood.amountSpecialFood + '</td>\n' +
                '          </tr>';
            }
          });
        }
      }

      table += ' <tr style="background: #D3D3D3">\n' +
        '            <td >Gesamt</td>\n' +
        '            <td>' + getTotalPortion(eachGroup, obj.settings) + '</td>\n' +
        '          </tr>';
      // tableDayContent += table + '</table> ';
    });
    // table +=       '          <tr style="background: #FFA07A">\n' +
    //   '            <td >Gesamt</td>\n' +
    //   '            <td>' + getTotalPortionsDay(obj.orderForEmail[indexDay].orderDayGroups, obj.settings) + '</td>\n' +
    //   '          </tr>\n' +
    //   '        </table>';
    tableContent += table + '</table> ';
    //   '          <tr style="background: #FFA07A">\n' +
    //   '            <td >Gesamt</td>\n' +
    //   '            <td>' + getTotalPortionsDay(obj.orderForEmail[indexDay].orderDayGroups, obj.settings) + '</td>\n' +
    //   '          </tr>\n' +
    //   '        </table>';
  });

  return tableContent;
}

function customerHasSpecialVisibleEmail(specialFood, customerInfo) {
  if(specialFood.amountSpecialFood > 0)return true;
  let show = false;
  customerInfo.order.specialShow.forEach((specialFoodCustomer) => {
    if (specialFoodCustomer.idSpecialFood === specialFood.idSpecialFood && specialFoodCustomer.selected) {
      show = true;
    }
  });
  return show;
}

module.exports = {
  getOrderBodyNew,
  getMenuName,
  customerHasSpecialVisibleEmail
}
