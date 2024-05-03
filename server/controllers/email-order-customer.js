const {getNameMenuDay} = require("./order-functions");
const {setBodyEmail} = require("./generate-email-body-daily-order");

function formatDate(date) {
  // Array of German day names
  const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

  // Extracting the day, date, month, and year from the date object
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1; // getMonth returns 0-11, so add 1 for correct month
  const year = date.getFullYear();

  // Formatting the day and month to always have two digits
  const dayFormatted = day < 10 ? '0' + day : day;
  const monthFormatted = month < 10 ? '0' + month : month;

  // Creating the formatted date string
  return `${dayName} ${dayFormatted}.${monthFormatted}.${year}`;
}


function customerHasSpecialFood(customer,specialFoodId){
  let boolean = false;
  customer.order.specialShow.forEach(eachSpecial=>{
    if(eachSpecial.idSpecialFood.toString()=== specialFoodId.toString() && eachSpecial.selected){
      boolean = true;
    }
  })
  return boolean;
}

function getEmailBodyOrderDayCustomer(weekkplanDay,ordersStudentCustomer,settings,customer,students,dateOrder) {
  let orderFormatted = formatDate(new Date(dateOrder))
  if (ordersStudentCustomer && ordersStudentCustomer.length > 0) {
    const orderCustomer =getOrdersDay(ordersStudentCustomer, weekkplanDay,settings,customer,students)
    const emailBody = setBodyEmail(orderCustomer,orderFormatted)
    const emailBodyBasic = {
      from: `${settings.tenantSettings.contact.companyName} <noreply@cateringexpert.de>`,
      replyTo: settings.orderSettings.confirmationEmail,
      to: [settings.orderSettings.confirmationEmail], // list of receivers
      subject: 'Bestellung',
      html: emailBody
    };
    return emailBodyBasic;

  }
}

function getOrdersDay(ordersCustomers,weekkplanDay,settings,customer,students){
  let arrayOrders =  setEmptyArrayDay(settings,weekkplanDay,customer);
  ordersCustomers.forEach(eachOrder =>{
    let indexSubGroupStudent = getIndexSubgroupStudent(eachOrder,arrayOrders,students);
    eachOrder.order.orderMenus.forEach(eachOrderMenu =>{
      if(eachOrderMenu.amountOrder > 0){
        arrayOrders[indexSubGroupStudent].orders.forEach((eachDay, indexDay) =>{
          if(eachDay.idSpecial.toString() === eachOrderMenu.idType.toString()){
            eachDay.amount += eachOrderMenu.amountOrder;
          }
        })
      }
    })
  })
  return arrayOrders;
}

function setEmptyArrayDay(settings,weekplanDay,customer){

  let arr = [];
  customer.order.split.forEach(eachGroup => {
    let obj = {
      nameSubGroup: eachGroup.displayGroup,
      group:eachGroup.group,
      orders:[]
    }
    settings.orderSettings.specials.forEach((eachType, indexType) => {
      if(eachType.typeOrder !== 'menu') return;
      obj.orders.push({
        typeSpecial: 'menu',
        idSpecial: eachType._id,
        nameSpecial: eachType.nameSpecial,
        nameMenu: getNameMenuDay({typeOrder:eachType.typeOrder,menuId:eachType._id},weekplanDay,settings),
        amount: 0,
      })
    })
    settings.orderSettings.specialFoods.forEach((eachType, indexType) => {
      console.log(eachType._id)
      if(customerHasSpecialFood(customer,eachType._id)){
        obj.orders.push({
          typeSpecial: 'special',
          idSpecial: eachType._id,
          nameSpecial: eachType.nameSpecialFood,
          nameMenu: eachType.nameSpecialFood,
          // nameMenu: getNameMenuDay({typeOrder:eachType.typeOrder,menuId:eachType._id},weekplanDay,settings),
          amount: 0,
        })
      }
    })
    arr.push(obj)
  })
  return arr;
}

function getIdMenuFromWeekplan(weekplanDay,idSpecial){
  for (let eachMenu of weekplanDay.mealTypesDay) {
    if(eachMenu.idSpecial.toString() === idSpecial.toString()){
      return eachMenu.idMenu;
    }
  }
  return null;
}

function getIndexSubgroupStudent(orderStudent,emptyArray,students){
  let student = students.find(student => student._id.toString() === orderStudent.studentId.toString());
  if(!student || !student.subgroup) return null;
  for (let i = 0; i < emptyArray.length; i++) {
    if(emptyArray[i].group.toString() === student.subgroup.toString()){
      return i;
    }
  }
  return null;
}

module.exports = {getEmailBodyOrderDayCustomer};
