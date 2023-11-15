import {MealtypesWeekplan, WeekplanDayInterface} from "./weekplan.interface";
import {Allergene} from "./allergenes.interface";
import {CustomerInterface} from "./customer.class";
import {SettingInterfaceNew} from "./setting.class";
import {MealModelInterface} from "./meal.interface";
import {MenuInterface} from "./menu.interface";

export function getAllergensPerMealOrderOverviewMenuO(special: OrderSubDetailNew,
                                                      weekplan: WeekplanDayInterface[],
                                                      indexDay: number):{nameMeal:string,allergenes:Allergene[]}[] {
  let arrayOfAllergenes:{nameMeal:string,allergenes:Allergene[]}[] = [];
  if (!weekplan || indexDay === -1 || indexDay === 5) {
    return [];
  }
  weekplan[indexDay].mealTypesDay.forEach(eachMealType => {
    if (eachMealType.idSpecial === special.idType) {
      if (!eachMealType.menu || !eachMealType.menu.recipe) {
        return
      }
      eachMealType.menu.recipe.forEach(eachRecipe => {
        if (!eachRecipe) return;
        arrayOfAllergenes.push({
          nameMeal:eachRecipe.nameMeal,
          allergenes:getAllergenesPerRecipe(eachRecipe)
        });
      })
    }
  });
  return arrayOfAllergenes;
}

export class OrderWeekClass implements OrderModelInterfaceNew {
  typeOrder: string = 'newModel';
  kw: number;
  year: number;
  order: OrderInterfaceNew [];
  customerId: string;

  constructor(customer: CustomerInterface,
              query: { kw: number, year: number },
              settings: SettingInterfaceNew,
              selectedWeek: WeekplanDayInterface[]) {
    this.order = this.setOrderForWeek(settings, customer, selectedWeek);
    this.customerId = customer.customerId;
    this.kw = query.kw;
    this.year = query.year;
  }

  setOrderForWeek(settings: SettingInterfaceNew, customer: CustomerInterface, selectedWeek: WeekplanDayInterface[]): OrderInterfaceNew [] {
    let arr = [];
    for (let i = 0; i < 5; i++) {
      arr.push(new OrderModelSingleDay(customer, settings, selectedWeek, i));
    }
    return arr;
  }
}

export class OrderModelSingleDay implements OrderInterfaceNew {
  orderDayGroups: OrderGroupDayNew[] = [];
  comment = '';

  constructor(customer: CustomerInterface, settings: SettingInterfaceNew, selectedWeek: WeekplanDayInterface[], index: number) {
    customer.order.split.forEach((eachSplitCustomer, indexCustomer) => {
      let objSplitEach:{groupId:string,order:OrderSubDetailNew[],specialFoodOrder:SpecialFoodOrderInterface[]} = {
        groupId: eachSplitCustomer.group,
        order: [],
        specialFoodOrder: getSpecialOrdersSubGroup(settings, customer)
      };
      selectedWeek[index].mealTypesDay.forEach(eachSpecial => {
        let order:OrderSubDetailNew = this.setOrderSplitEach(eachSpecial,customer,settings,selectedWeek,index);
        if(order){
          objSplitEach.order.push(order);
        }
      });
      this.orderDayGroups.push(objSplitEach);
    });
  }
  setOrderSplitEach(eachSpecial:MealtypesWeekplan,
                    customer: CustomerInterface,
                    settings: SettingInterfaceNew,
                    selectedWeek: WeekplanDayInterface[],
                    index: number):OrderSubDetailNew {
    // if (eachSpecial.typeSpecial === 'side' && !settings.orderSettings.sideOrderSeparate) {
    //   return null;
    // }
    // if (eachSpecial.typeSpecial === 'dessert' && !settings.orderSettings.dessertOrderSeparate) {
    //   return null;
    // }
    let order: OrderSubDetailNew = {
      isDge: eachSpecial.isDge,
      typeOrder: eachSpecial.typeSpecial,
      nameOrder: this.getNameLabelOrderOverview0(eachSpecial, selectedWeek[index]),
      idType: eachSpecial.idSpecial,
      amountOrder: 0,
      idMenu:this.getMenuIdOrderOverview(eachSpecial, selectedWeek[index]),
      nameLabelExist: this.doesNameLabelExist(eachSpecial, selectedWeek[index]),
      specialFoodOrder: getSpecialOrdersPossibleMenu(eachSpecial, settings, customer),
      isDisabled: this.getLockInputOrderOverview(selectedWeek[index], eachSpecial),
    };
    order.allergenes = this.getAllergensOrderOverviewMenuO(order, selectedWeek, index)
    order.allergensPerMeal = getAllergensPerMealOrderOverviewMenuO(order, selectedWeek, index);
    return order;
  }
  doesNameLabelExist(special: MealtypesWeekplan, weekplan: WeekplanDayInterface): boolean {
    let exist = false;
    weekplan.mealTypesDay.forEach(eachMealType => {
      if (eachMealType.idSpecial === special.idSpecial) {
        if (eachMealType.menu) {
          exist = true;
        }
      }
    });
    return exist;

  }
  getMenuIdOrderOverview(special: MealtypesWeekplan, weekplan: WeekplanDayInterface): (string | null) {
    let menu = null
    weekplan.mealTypesDay.forEach(eachMealType => {
      if (eachMealType.idSpecial === special.idSpecial) {
        if (eachMealType.menu) {
          menu = eachMealType.menu._id;
        }
      }
    });
    return menu;
  }
  getNameLabelOrderOverview0(special: MealtypesWeekplan, weekplan: WeekplanDayInterface): string {
    let name = special.nameSpecial;
    weekplan.mealTypesDay.forEach(eachMealType => {
      if (eachMealType.idSpecial === special.idSpecial) {
        if (eachMealType.menu) {
          name = eachMealType.menu.nameMenu;
        }
      }
    });
    return name;

  }

  getLockInputOrderOverview(weekplan: WeekplanDayInterface, special: MealtypesWeekplan): boolean {
    if (!weekplan) {
      return true;
    }
    for (let i = 0; i < weekplan.mealTypesDay.length; i++) {
      if (weekplan.mealTypesDay[i].idSpecial === special.idSpecial) {
        if (!weekplan.mealTypesDay[i].idMenu) {
          return true;
        }
      }
    }
    return false;
  }


  getAllergensOrderOverviewMenuO(special: OrderSubDetailNew, weekplan: WeekplanDayInterface[], indexDay: number): Allergene[] {
    let allergenen:Allergene[] = [];
    if (!weekplan || indexDay === -1 || indexDay === 5) {
      return allergenen;
    }
    weekplan[indexDay].mealTypesDay.forEach(eachMealType => {
      if (eachMealType.idSpecial === special.idType) {
        if (!eachMealType.menu) {
          return;
        }
        allergenen = calculateAllergenesMenu(eachMealType.menu);
      }
    });
    return allergenen;
  }
}
export interface PermanentOrderInterface{
  _id?:string;
  active:boolean;
  order: OrderInterfaceNew [];
  customerId: string;
}
export interface OrderModelInterfaceNew {
  active?: boolean;
  _id?: string;
  typeOrder: string;
  kw: number;
  year: number;
  order: OrderInterfaceNew [];
  customerId: string;
}

export interface OrderInterfaceNew {
  orderDayGroups: OrderGroupDayNew[];
  comment: string;
}

export interface OrderGroupDayNew {
  groupId: string;
  specialOrdersPossibleGroup?: SpecialFoodOrderInterface[];
  order: OrderSubDetailNew[];
  specialFoodOrder?: SpecialFoodOrderInterface[];
}

export interface SpecialFoodOrderInterface {
  nameSpecialFood: string,
  active: boolean,
  idSpecialFood: string,
  amountSpecialFood: number
}

export interface OrderSubDetailNew {
  typeOrder: string;//Special Dessert or Side
  nameOrder: string; //Special === pre ? Menu => Either One
  idType: string;
  amountOrder: number;
  isDge?: boolean;
  isDisabled?: boolean;
  allergenes?: Allergene[];
  allergenesString?: string[];
  specialOrdersPossibleMenu?: SpecialFoodOrderInterface[];
  specialFoodOrder?: SpecialFoodOrderInterface[];
  nameLabelExist?: boolean;
  idMenu: (string |null);
  allergensPerMeal?:{nameMeal:string,allergenes:Allergene[]}[];
}

export interface SpecialFoodInterface {
  _id?: string,
  nameSpecialFood: string,
  priceSpecialFood: { groupType: string, priceSpecial: number }[],
  allergenes: string[]
}


export interface SpecialOrderSettings {
  nameSpecial: string,
  _id: string,
  typeOrder: string,
  isActive: boolean,
  pricesSpecial: { groupType: string, priceSpecial: number }[]
}

export function getSpecialOrdersSubGroup(setting: SettingInterfaceNew,
                                         customer: CustomerInterface): SpecialFoodOrderInterface[] {
  let arraySpecial:SpecialFoodOrderInterface[] = [];
  setting.orderSettings.specialFoods.forEach(specialFood => {
    // if(!specialFood)return
    let obj:SpecialFoodOrderInterface = {
      nameSpecialFood: specialFood.nameSpecialFood,
      idSpecialFood: specialFood._id  || '',
      amountSpecialFood: 0,
      active: true,
    }
    if (!specialFoodShownCustomer(specialFood, customer)) {
      obj.active = false;
    }
    arraySpecial.push(obj)
  });
  return arraySpecial
}

// export function getSpecialOrdersPossibleWeekplan(selectedWeek: WeekplanDayInterface[],
//                                                  setting: SettingInterfaceNew,
//                                                  customer: CustomerInterface,
//                                                  index: number): SpecialFoodOrderInterface[] {
//   let arraySpecial = [];
//   if (selectedWeek.length === 0) {
//     return arraySpecial;
//   }
//   selectedWeek[index].mealTypesDay.forEach((orderDay) => {
//     arraySpecial = [...arraySpecial, ...getSpecialOrdersPossibleMenu(orderDay, setting, customer)];
//   });
//   return removeDuplicatesSpecialFood(arraySpecial);
// }

export function setSpecialArrayNoWeekplanExist(setting: SettingInterfaceNew, customer: CustomerInterface, orderDayGroup: MealtypesWeekplan): SpecialFoodOrderInterface[] {
  let arraySpecial:SpecialFoodOrderInterface[] = [];
  setting.orderSettings.specialFoods.forEach((specialFood) => {
    let specialFoodOrder = {
      isShownCustomer: specialFoodShownCustomer(specialFood, customer),
      nameSpecialFood: specialFood.nameSpecialFood,
      idSpecialFood: specialFood._id ||'',
      amountSpecialFood: 0,
      active: false,
    }
    if (specialFoodShownCustomer(specialFood, customer) && setting.orderSettings.showMenuWithoutName) {
      specialFoodOrder.active = true;
    }
    arraySpecial.push(specialFoodOrder);
  });
  return arraySpecial;
}

export function specialFoodIsInAllergiesBySelection(specialFood: SpecialFoodInterface, allergenes: string[]): boolean {
  for (let i = 0; i < specialFood.allergenes.length; i++) {
    for (let i2 = 0; i2 < allergenes.length; i2++) {
      if (specialFood.allergenes[i] === allergenes[i2]) {
        return true;
      }
    }
  }
  return false;
}

export function getSpecialOrdersPossibleMenu(orderDayGroup: MealtypesWeekplan, setting: SettingInterfaceNew, customer: CustomerInterface): SpecialFoodOrderInterface[] {
  let arraySpecial:SpecialFoodOrderInterface[] = [];
  if(orderDayGroup.typeSpecial === 'side' && !setting.orderSettings.specialShowSideIfShowMenu) return arraySpecial
  if(orderDayGroup.typeSpecial === 'dessert' && !setting.orderSettings.specialShowDessertIfShowMenu) return arraySpecial
  if (!orderDayGroup.menu) {
    return setSpecialArrayNoWeekplanExist(setting, customer, orderDayGroup);
  }
  setting.orderSettings.specialFoods.forEach((specialFood) => {
    if (specialFoodShownCustomer(specialFood, customer) && specialFoodIsInAllergies(specialFood, orderDayGroup.allergenes)) {
      arraySpecial.push({
        nameSpecialFood: specialFood.nameSpecialFood,
        idSpecialFood: specialFood._id || '',
        amountSpecialFood: 0,
        active: true,
      });
    } else {
      arraySpecial.push({
        nameSpecialFood: specialFood.nameSpecialFood,
        idSpecialFood: specialFood._id || '',
        amountSpecialFood: 0,
        active: false,
      });
    }
    // }else{
    //   arraySpecial.push({
    //     nameSpecialFood: specialFood.nameSpecialFood,
    //     idSpecialFood: specialFood._id,
    //     amountSpecialFood: 0,
    //     active: false,
    //     visible:false
    //   })
  });
  return removeDuplicatesSpecialFood(arraySpecial);
}

function removeDuplicatesSpecialFood(array: SpecialFoodOrderInterface[]): SpecialFoodOrderInterface[] {
  // Create a map where the keys are idSpecialFood and the values are the objects
  let map = new Map<string, SpecialFoodOrderInterface>();

  // Iterate over the array
  for (let obj of array) {
    // If the map already has an object with this idSpecialFood
    if (map.has(obj.idSpecialFood)) {
      // If the existing object is not active but the new one is, replace it
      if (!map.get(obj.idSpecialFood)!.active && obj.active) {
        map.set(obj.idSpecialFood, obj);
      }
    } else {
      // If the map doesn't have an object with this idSpecialFood, add the new one
      map.set(obj.idSpecialFood, obj);
    }
  }

  // Convert the map values to an array and return it
  return Array.from(map.values());
}

export function specialFoodShownCustomer(specialFood: SpecialFoodInterface, customer: CustomerInterface): boolean {
  let show = false;
  customer.order.specialShow.forEach((specialFoodCustomer) => {
    if (specialFoodCustomer.idSpecialFood === specialFood._id && specialFoodCustomer.selected) {
      show = true;
    }
  });
  return show;
}

export function specialFoodIsInAllergies(specialFood: SpecialFoodInterface, allergenes: Allergene[]): boolean {
  for (let i = 0; i < specialFood.allergenes.length; i++) {
    for (let i2 = 0; i2 < allergenes.length; i2++) {
      if (specialFood.allergenes[i] === allergenes[i2]._id) {
        return true;
      }
    }
  }
  return false;
}

export function getAllergenesPerRecipe(recipe: MealModelInterface): Allergene[] {
  let allergenes:Allergene[] = [];
  if (!recipe || typeof recipe !== 'object') {
    return [];
  }
  recipe.allergens.forEach(eachAllergen => {
    if (!eachAllergen) {
      return;
    }
    allergenes.push(eachAllergen);
  });
  return allergenes;
}

export function calculateAllergenesMenu(menu: MenuInterface):Allergene[] {
  let allergens:Allergene[] = [];
  if (!menu) {
    return [];
  }

  menu.recipe.forEach(eachMeal => {
    if (!eachMeal || typeof eachMeal !== 'object') {
      return;
    }
    eachMeal.allergens.forEach(eachAllergen => {
      if (!eachAllergen) {
        return;
      }
      allergens.push(eachAllergen);
    });
  });
  return removeDuplicatesMenuAllergene(allergens);
}

export function removeDuplicatesMenuAllergene(allergens: Allergene[]): Allergene[] {
  const uniqueAllergens = allergens.filter((allergen, index, self) => {
    return index === self.findIndex(a => a.name_allergene === allergen.name_allergene);
  });

  return uniqueAllergens;
}
