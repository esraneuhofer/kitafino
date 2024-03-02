function getTotalPortion(orderGroup,setting) {
  let total = 0;
  orderGroup.order.forEach(eachSpecial => {
    if (eachSpecial.typeOrder === 'menu' || eachSpecial.typeOrder === 'special') {
      total += eachSpecial.amountOrder;
      if(setting.orderSettings.specialShowPerMeal){
        eachSpecial.specialFoodOrder.forEach(eachSpecialFood => {
          total += eachSpecialFood.amountSpecialFood;
        });
      }
    }
  });
  if(!setting.orderSettings.specialShowPerMeal){
    orderGroup.specialFoodOrder.forEach(eachSpecialFood => {
      if(!specialFoodStillExistsInSettings(eachSpecialFood.idSpecialFood,setting))return
      total += eachSpecialFood.amountSpecialFood;
    });
  }
  return total;
}
function getTotalPortionsDay(orderModelDay ,settings) {
  let total = 0;
  if(!orderModelDay)return 0;
  orderModelDay.forEach(eachDay => {
    total += getTotalPortion(eachDay,settings);
  });
  return total;
}
function getDisplayName(splitName,customerInfo) {
  let name = '';
  customerInfo.order.split.forEach(eachSplit => {
    if (eachSplit.group === splitName) {
      name = eachSplit.displayGroup;
    }
  });
  return name;
}
function specialFoodStillExistsInSettings(idSpecialFood, settings) {
  return settings.orderSettings.specialFoods.some(eachSpecialFood => eachSpecialFood._id === idSpecialFood);
}

function hideSpecialFoodIfNoMenuShown(order, showMenuWithoutName) {
  if (showMenuWithoutName) {
    return false;
  }
  let allNotShown = true;
  order.forEach(eachOrderDay => {
    if(!eachOrderDay.isDisabled || eachOrderDay.amountOrder > 0){
      allNotShown = false;
    }
  })
  return allNotShown;
}

module.exports = {
  getTotalPortionsDay,
  getDisplayName,
  getTotalPortion,
  hideSpecialFoodIfNoMenuShown
};
