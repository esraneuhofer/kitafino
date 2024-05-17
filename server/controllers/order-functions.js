const {getIndexDayOrder} =  require("./deadline-orderclass.functions")
const {getWeekNumber} = require("./deadline-deadline.functions");
const {set} = require("mongoose");

function getSpecialFoodNameById(settings, idSpecialFood) {
  let nameSpecialFood = 'Allergiker Essen';
  for (let specialFood of settings.orderSettings.specialFoods) {
    if (specialFood._id.toString() === idSpecialFood.toString()) {
      nameSpecialFood = specialFood.nameSpecialFood
    }
  }
  return nameSpecialFood;
}

function getNameMenuDay(permanentOrder,weekplanDay,settings){
  let nameMenu = 'Menu';
  if(permanentOrder.typeSpecial === 'special'){
    nameMenu = getSpecialFoodNameById(settings,permanentOrder.menuId)
  }else{
    return getSpecialNameById(settings,permanentOrder.menuId,weekplanDay)
  }
  return nameMenu;

}
function getSpecialNameById(settings, idSpecialFood,weekplanDay) {

  let nameSpecialFood = 'Menu';
  weekplanDay.mealTypesDay.forEach(eachMenu => {
    if(eachMenu.idSpecial.toString() === idSpecialFood.toString()){
     if(eachMenu.menu){
       nameSpecialFood =  eachMenu.menu.nameMenu;
     }
    }
  })
  return nameSpecialFood;
}

function getOrderStudent(priceStudent, settings, eachPermanentOrderStudent, selectedWeekDay,indexDay,menus) {
  let objOrder = {
    orderMenus: [],
    specialFoodOrder: []
  }
  if(eachPermanentOrderStudent.daysOrder[indexDay].typeSpecial === 'special'){
    let nameSpecialFood = getSpecialFoodNameById(settings,eachPermanentOrderStudent.daysOrder[indexDay].menuId)
    objOrder.orderMenus.push({
      idMenu:null,
      typeOrder:'specialFood',
      nameOrder:nameSpecialFood,
      idType:eachPermanentOrderStudent.daysOrder[indexDay].menuId,
      amountOrder:1,
      priceOrder:priceStudent,
      menuSelected:true
    })
  }else{
    let nameSpecial = getSpecialNameById(settings,eachPermanentOrderStudent.daysOrder[indexDay].menuId,selectedWeekDay,menus)
    objOrder.orderMenus.push({
      idMenu:selectedWeekDay.menuId || null,
      typeOrder:'menu',
      nameOrder:nameSpecial,
      idType:eachPermanentOrderStudent.daysOrder[indexDay].menuId,
      amountOrder:1,
      priceOrder:priceStudent,
      menuSelected:true
    })
  }
  return objOrder;
}

function setOrderStudentBackend(customer,
                                dateOrder,
                                tenantId,
                                eachPermanentOrderStudent,
                                selectedWeek,
                                settings,
                                priceStudent,
                                menus){
  const indexDay = getIndexDayOrder(dateOrder);
  let calenderWeek = getWeekNumber(new Date(dateOrder))
  let year = new Date(dateOrder).getFullYear();
  const selectedWeekDay = selectedWeek.weekplan[indexDay];
  return {
    kw: calenderWeek,
    year: year,
    customerId: customer.customerId,
    dateOrder: dateOrder,
    tenantId: tenantId,
    studentId: eachPermanentOrderStudent.studentId,
    order:getOrderStudent(priceStudent,settings,eachPermanentOrderStudent,selectedWeekDay,indexDay,menus)
  }
}

function getPriceStudent(selectedStudent, customer, settings) {
  if(!selectedStudent)return 0;
  let priceStudent = 0;
  customer.billing.group.forEach(eachGroup => {
    if(eachGroup.groupId === selectedStudent.subgroup){

      priceStudent = getPriceStudentDependingOnSettings(settings,eachGroup.prices)
    }
  })
  return priceStudent;
}

function getPriceStudentDependingOnSettings(settings,eachPrice) {
  let priceStudent = 0;
  if(settings.invoiceSettings.differentPricesMenus){
    //Todo: Add different Prices for each Menu
    eachPrice.forEach(eachPrice => {
      if(eachPrice.typeSpecial === 'menu'){
        if(eachPrice.priceSpecial > priceStudent){
          priceStudent = eachPrice.priceSpecial;
        }
      }
    })
  }else{
    eachPrice.forEach(eachPrice => {
      if(eachPrice.typeSpecial === 'menu'){
        if(eachPrice.priceSpecial > priceStudent){
          priceStudent = eachPrice.priceSpecial;
        }
      }
    })
  }
  return priceStudent;
}

function getTotalPrice (order) {
  let totalPrice = 0;
  order.order.orderMenus.forEach((order) => {
    totalPrice += order.amountOrder * order.priceOrder;
  })
  if(order.order.specialFoodOrder.length > 0){
    order.order.specialFoodOrder.forEach((order) => {
      totalPrice += order.amountSpecialFood * order.priceMenu;
    })
  }

  return totalPrice;
}

module.exports = {
  getTotalPrice,
  setOrderStudentBackend,
  getPriceStudent,
  getNameMenuDay
};
