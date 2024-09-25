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
  getTotalPortion,
  hideSpecialFoodIfNoMenuShown
};
