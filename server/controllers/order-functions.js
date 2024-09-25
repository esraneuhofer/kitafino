
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
function getSpecialNameById(settings, idSpecialFood,weekplanDay,customer) {
  let nameSpecialFood = 'Menu';
  let components = [];

  weekplanDay.mealTypesDay.forEach(eachMenu => {
    if(eachMenu.idSpecial.toString() === idSpecialFood.toString()){
     if(eachMenu.menu){
       components.push(eachMenu.menu.nameMenu)
     }
    }
    if(eachMenu.typeSpecial === 'side'){
      if(eachMenu.menu) {
        components.push(eachMenu.menu.nameMenu)

      }
    }
    if (eachMenu.typeSpecial === 'dessert'){
      if(eachMenu.menu) {
        components.push(eachMenu.menu.nameMenu)
      }
    }
  })
  let nameCombined = components.join(' , ')
  if(nameCombined.length >0){
    nameSpecialFood = nameCombined;
  }
  return nameSpecialFood;
}

function getOrderStudent(priceStudent, settings, eachPermanentOrderStudent, selectedWeekDay,indexDay,menus,customer) {
  let objOrder = {
    orderMenus: [],
    specialFoodOrder: []
  }
  if(eachPermanentOrderStudent.daysOrder[indexDay].typeSpecial === 'special'){
    let nameSpecialFood = getSpecialFoodNameById(settings,eachPermanentOrderStudent.daysOrder[indexDay].menuId,customer)
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
    let nameSpecial = getSpecialNameById(settings,eachPermanentOrderStudent.daysOrder[indexDay].menuId,selectedWeekDay,menus,customer)
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
  getPriceStudent,
  getNameMenuDay
};
