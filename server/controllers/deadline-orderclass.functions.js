const dayArray = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

const {getWeekNumber, getDeadline} = require('./deadline-deadline.functions');



function createOrderWeekClass(customer, query, settings, selectedWeek) {
  // Assuming setOrderForWeek is a method that you've defined elsewhere
  // and needs to be converted into a function that is called here.
  return{
    order : setOrderForWeek(settings, customer, selectedWeek),
    customerId : customer.customerId,
    kw : query.kw,
    year : query.year,
    typeOrder : 'newModel'
  };

}

// Example of converting a method to a function
// If `setOrderForWeek` was originally a method of your class, you need to define it as a standalone function.
// You would need to adjust its usage accordingly.
function setOrderForWeek(settings, customer, selectedWeek) {
  let arr = [];
  for (let i = 0; i < 5; i++) {
    arr.push(createOrderModelSingleDay(customer, settings, selectedWeek, i));
  }
  return arr;
}

function createOrderModelSingleDay(customer, settings, selectedWeek, index) {
  const orderDayGroups = [];

  customer.order.split.forEach((eachSplitCustomer, indexCustomer) => {
    const orderDayGroupSplit = createOrderDayGroupSplit(eachSplitCustomer, settings, customer, selectedWeek, index);
    orderDayGroups.push(orderDayGroupSplit);
  });

  return {
    orderDayGroups: orderDayGroups,
    comment: '', // Initialize with default value or modify as needed
  };
}


function createOrderDayGroupSplit(eachSplitCustomer, settings, customer, selectedWeek, index) {
  const groupId = eachSplitCustomer.group;
  const specialFoodOrder = getSpecialOrdersSubGroup(settings, customer);
  const order = [];

  if (!selectedWeek || selectedWeek.length === 0) {
    return {
      groupId,
      specialOrdersPossibleGroup: [],
      order,
      specialFoodOrder
    };
  }

  selectedWeek[index].mealTypesDay.forEach(eachSpecial => {
    let orderDetail = {
      nameLabelExist: eachSpecial.nameSpecial,
      typeOrder: eachSpecial.typeSpecial,
      nameOrder: eachSpecial.nameSpecial,
      idType: eachSpecial.idSpecial,
      amountOrder: 0,
      // idMenu: getMenuIdOrderOverview(eachSpecial, selectedWeek[index]),
      idMenu: null,
      specialFoodOrder: getSpecialOrdersPossibleMenu(eachSpecial, settings, customer),
      isDisabled: false,
      allergenes: [] // This will be set below
    };

    // Assuming getAllergensOrderOverviewMenuO is a function that returns allergenes based on the given parameters
    orderDetail.allergenes =[]

    order.push(orderDetail);
  });

  return {
    groupId,
    specialOrdersPossibleGroup: [], // Assuming this needs to be initialized as empty or set similarly to specialFoodOrder
    order,
    specialFoodOrder
  };
}
function getSpecialOrdersSubGroup(setting, customer) {
  let arraySpecial = [];
  setting.orderSettings.specialFoods.forEach(specialFood => {
    let obj = {
      nameSpecialFood: specialFood.nameSpecialFood,
      idSpecialFood: specialFood._id,
      amountSpecialFood: 0,
      active: specialFoodShownCustomer(specialFood, customer),
    }

    arraySpecial.push(obj)
  });
  return arraySpecial
}

function getSpecialOrdersPossibleMenu(orderDayGroup, setting, customer) {
  let arraySpecial = [];
  if (orderDayGroup.typeSpecial === 'side' && !setting.orderSettings.specialShowSideIfShowMenu) {
    return arraySpecial;
  }
  if (orderDayGroup.typeSpecial === 'dessert' && !setting.orderSettings.specialShowDessertIfShowMenu) {
    return arraySpecial;
  }
  if (!orderDayGroup.menu) {
    return setSpecialArrayNoWeekplanExist(setting, customer);
  }
  setting.orderSettings.specialFoods.forEach((specialFood) => {
    // if (specialFoodShownCustomer(specialFood, customer)) {
    if (specialFoodIsMenu(specialFood, orderDayGroup.menu)) {
      // if (specialFoodIsInAllergies(specialFood, orderDayGroup.allergenes)) {
      arraySpecial.push({
        nameSpecialFood: specialFood.nameSpecialFood,
        idSpecialFood: specialFood._id,
        amountSpecialFood: 0,
        active: specialFoodShownCustomer(specialFood, customer),
      });
    }
  });
  return removeDuplicatesSpecialFood(arraySpecial);
}

function specialFoodShownCustomer(specialFood, customer) {
  let show = false;
  customer.order.specialShow.forEach((specialFoodCustomer) => {
    if (specialFoodCustomer.idSpecialFood === specialFood._id && specialFoodCustomer.selected) {
      show = true;
    }
  });
  return show;
}

function specialFoodIsMenu(specialFood, menu) {
  let bool = false;
  menu.recipe.forEach((eachRecipe) => {
    eachRecipe.specials.forEach((eachSpecial) => {
      if (eachSpecial.idSpecial === specialFood._id && eachSpecial.isSelected) {
        bool = true;
      }
    });
  });
  return bool;
}

function setSpecialArrayNoWeekplanExist(setting, customer) {
  let arraySpecial = [];
  setting.orderSettings.specialFoods.forEach((specialFood) => {
    arraySpecial.push({
      nameSpecialFood: specialFood.nameSpecialFood,
      idSpecialFood: specialFood._id,
      amountSpecialFood: 0,
      active: specialFoodShownCustomer(specialFood, customer),
    });
    // }
  });
  return arraySpecial;
}

function removeDuplicatesSpecialFood(array) {
  const map = array.reduce((acc, obj) => {
    const existingObj = acc.get(obj.idSpecialFood);
    if (existingObj) {
      if (!existingObj.active && obj.active) {
        acc.set(obj.idSpecialFood, obj);
      }
    } else {
      acc.set(obj.idSpecialFood, obj);
    }
    return acc;
  }, new Map());

  return Array.from(map.values());
}

function getOrdersStudent(ordersStudents,
                          customer,
                          orderOverview,
                          settings,
                          selectedWeek,
                          allStudents) {

  if(ordersStudents.length === 0)return [];
  if(!customer)return [];
  if(allStudents.length === 0)return [];
  let orderEmpty = createOrderWeekClass(
    customer, {
      kw: orderOverview.queryCW,
      year: orderOverview.queryYears
    }, settings, selectedWeek)
  ordersStudents.forEach(eachOrderStudent =>{
    if(eachOrderStudent.customerId.equals(customer.customerId)){

      let studentModel = allStudents.find(eachStudent => eachStudent._id.equals(eachOrderStudent.studentId));
      if(!studentModel)return;
      let indexDay = getIndexDayOrder(eachOrderStudent.dateOrder);
      orderEmpty.order[indexDay].orderDayGroups.forEach((eachOrderGroup,indexOrderGroup) =>{
        if(eachOrderGroup.groupId === studentModel.subgroup){
          let orderStudent = getOrderStudent(eachOrderStudent)
          if(!orderStudent)return;
          if(orderStudent.typeOrder === 'specialFood'){
            let indexOrderStudentOrderSpecial = getIndexOrderStudentOrderSpecial(eachOrderStudent,eachOrderGroup);
            if(indexOrderStudentOrderSpecial !== -1){
              orderEmpty.order[indexDay].orderDayGroups[indexOrderGroup].specialFoodOrder[indexOrderStudentOrderSpecial].amountSpecialFood += 1;
            }
          }else{
            let indexOrderStudentOrder = getIndexOrderStudentOrder(eachOrderStudent,eachOrderGroup);
            if(indexOrderStudentOrder !== -1){
              orderEmpty.order[indexDay].orderDayGroups[indexOrderGroup].order[indexOrderStudentOrder].amountOrder += 1;
            }
          }
        }
      })
    }
  })
  orderEmpty.isStudentOrder = true;
  return orderEmpty;
}

function getOrderStudent(orderStudent) {
  let order = null;
  orderStudent.order.orderMenus.forEach(eachOrderMenu =>{
    if(eachOrderMenu.amountOrder > 0){
      order =  eachOrderMenu;
    }
  })
  return order;
}

function getIndexOrderStudentOrderSpecial(orderStudent, orderGroup) {
  let indexOrder = -1;
  orderStudent.order.orderMenus.forEach(eachOrderMenu =>{
    if(eachOrderMenu.amountOrder > 0){
      orderGroup.specialFoodOrder.forEach((eachOrder,indexOrderSub) =>{
        if(eachOrder.idSpecialFood.equals(eachOrderMenu.idType)){
          indexOrder = indexOrderSub;
        }
      })
    }
  })
  return indexOrder;
}
function getIndexOrderStudentOrder(orderStudent, orderGroup) {
  let indexOrder = -1;
  orderStudent.order.orderMenus.forEach(eachOrderMenu =>{
    if(eachOrderMenu.amountOrder > 0){
      orderGroup.order.forEach((eachOrder,indexOrderSub) =>{
        if(eachOrder.idType.equals(eachOrderMenu.idType)){
          indexOrder = indexOrderSub;
        }
      })
    }
  })
  return indexOrder;
}


function getIndexDayOrder(dateOrder) {
  let orderOverview = {
    queryYears: new Date(dateOrder).getFullYear(),
    queryCW: getWeekNumber(new Date(dateOrder))
  };
  let startDay = getDateMondayFromCalenderweek(orderOverview.queryCW, orderOverview.queryYears);
  var day = new Date(dateOrder);
  return (day.getDay()) - (new Date(startDay)).getDay();
}

function getDateMondayFromCalenderweek(w, y) {
  let simple = new Date(y, 0, 1 + (w - 1) * 7);
  let dow = simple.getDay();
  let ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}



module.exports = {
  getIndexDayOrder,
  getOrdersStudent,
  getDateMondayFromCalenderweek
};
