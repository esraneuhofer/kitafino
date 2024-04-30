const {getIndexDayOrder} =  require("./deadline-orderclass.functions")
const {getWeekNumber} = require("./deadline-deadline.functions");

function getSpecialFoodNameById(settings, idSpecialFood) {
  let nameSpecialFood = 'Sonderessen';
  for (let specialFood of settings.orderSettings.specialFoods) {
    if (specialFood._id === idSpecialFood) {
      nameSpecialFood = specialFood.nameSpecialFood
    }
  }
  return nameSpecialFood;
}

function getSpecialNameById(settings, idSpecialFood,weekplanDay,menus) {
  let nameSpecialFood = 'menu';
  for (let specialFood of settings.orderSettings.specials) {
    if (specialFood._id === idSpecialFood) {
      nameSpecialFood = specialFood.nameSpecial
    }
  }
  for (let mealTypeDay of weekplanDay.mealTypesDay) {
    if(mealTypeDay.idSpecial === idSpecialFood && mealTypeDay.idMenu){
      nameSpecialFood = mealTypeDay.menu.nameMenu
    }
  }
  return nameSpecialFood;
}
function getOrderStudent(priceStudent, settings, eachPermanentOrderStudent, selectedWeekDay,indexDay) {
  let objOrder = {
    orderMenus: [],
    specialFoodOrder: []
  }
  if(eachPermanentOrderStudent.isSpecial){
    let nameSpecialFood = getSpecialFoodNameById(settings,eachPermanentOrderStudent.daysOrder[indexDay].menuId)
    objOrder.specialFoodOrder.push({
      typeOrder:'specialFood',
      nameOrder:nameSpecialFood,
      idType:eachPermanentOrderStudent.daysOrder[indexDay].menuId,
      amountSpecialFood:1,
      priceMenu:priceStudent,
      menuSelected:true
    })
    let nameSpecial = getSpecialNameById(settings,eachPermanentOrderStudent.daysOrder[indexDay].menuId,selectedWeekDay)
    objOrder.orderMenus.push({
      typeOrder:'menu',
      nameOrder:nameSpecial,
      idType:eachPermanentOrderStudent.daysOrder[indexDay].menuId,
      amountOrder:0,
      priceOrder:priceStudent,
      menuSelected:true
    })
  }else{
    let nameSpecial = getSpecialNameById(settings,eachPermanentOrderStudent.daysOrder[indexDay].menuId,selectedWeekDay)
    objOrder.specialFoodOrder.push({
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
                                studentModel){
  const indexDay = getIndexDayOrder(dateOrder);
  let calenderWeek = getWeekNumber(new Date(dateOrder))
  let year = new Date(dateOrder).getFullYear();
  const priceStudent = getPriceStudent(studentModel,customer,settings)
  const selectedWeekDay = selectedWeek.weekplan[indexDay];
  return {
    kw: calenderWeek,
    year: year,
    customerId: customer.customerId,
    dateOrder: dateOrder,
    tenantId: tenantId,
    studentId: eachPermanentOrderStudent.studentId,
    order:getOrderStudent(priceStudent,settings,eachPermanentOrderStudent,selectedWeekDay,indexDay)
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


module.exports = {
  setOrderStudentBackend
};
