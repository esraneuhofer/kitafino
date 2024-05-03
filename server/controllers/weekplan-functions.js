const dayArray = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

function getMenuFromId(id,menus){
  for(let i = 0; i  < menus.length; i++){
    if(menus[i]._id.toString() === id.toString()){
      return menus[i];
    }
  }
  return null
}
function getMenusForWeekplan(weekplan,settings, querySelection,menus){
  if (!weekplan) {
    return getWeekplanModel(settings, querySelection);
  }
  let weekplan$ = JSON.parse(JSON.stringify(weekplan));
  weekplan$.weekplan.forEach((eachDay, index) => {
    eachDay.mealTypesDay.forEach((eachType, indexType) => {
      if (!eachType.idMenu) {
        return;
      }
      let menu = getMenuFromId(eachType.idMenu, menus);
      if (!menu) {
        return;
      }
      eachType.menu = menu;
      // eachType.allergensPerMeal =  setAllergenesRecipeMenu(eachType);
      eachType.allergensPerMeal =  [];
    });
  });
  return weekplan$;
}

function getWeekplanModel(setting,dateQuery) {
  return{
    year:dateQuery.year,
    week:dateQuery.week,
    weekplan:getWeekplanArray(setting),
    allowOneMenuEachDay:[true,true,true,true,true],
    nameWeekplan:'',
    groupsWeekplan:[]
  }
}
function getWeekplanArray(setting){
  let arr = [];
  dayArray.forEach((each, index) => {
    arr.push({
      nameDay:dayArray[index],
      mealTypesDay:getMealTypesForWeekplan(setting)
    })
  });
  return arr;
}

function getMealTypesForWeekplan(setting){
  let arr = [];
  let order = ['side','menu','special','dessert']
  order.forEach(each =>{
    setting.orderSettings.specials.forEach(eachSpecial =>{
      if(eachSpecial.typeOrder === each){
        arr.push({typeSpecial:eachSpecial.typeOrder,idSpecial:eachSpecial._id,nameSpecial:eachSpecial.nameSpecial,menu:null,idMenu:null,isDge:false})
      }
    })
  })
  return arr;
}

module.exports = {
  getWeekplanModel,
getMenusForWeekplan
};
