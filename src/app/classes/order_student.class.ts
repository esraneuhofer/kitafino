import { CustomerInterface } from "./customer.class";
import { SettingInterfaceNew, SpecialFoodInterface } from "./setting.class";
import { MealtypesWeekplan, WeekplanDayInterface } from "./weekplan.interface";
import { StudentInterface } from "./student.class";
import { Allergene } from "./allergenes.interface";
import { MenuInterface } from "./menu.interface";
import { MealModelInterface } from "./meal.interface";
import { getSpecialFoodById } from "../functions/special-food.functions";
import { roundNumberTwoDigits } from "../functions/generell.functions";
import { EinrichtungInterface } from "./einrichtung.class";


export interface SpecialFoodOrderInterface {
  priceOrder: number;
  menuSelected: boolean;
  nameSpecialFood: string;
  active: boolean;
  idSpecialFood: string;
  amountSpecialFood: number;
}


export interface OrderInterfaceStudent {
  orderId?: string;
  _id?: string;
  studentId: (string | undefined)
  kw: number;
  year: number;
  dateOrder: string; // Format: 'YYYY-MM-DD'
  subgroup?: string;
  order: OrderInterfaceStudentDay;
  customerId: string;
  groupIdCustomer: string;
  username?: string;
  isBut: boolean;
  isNachbestellung?: boolean;

}

interface OrderInterfaceStudentDay {
  comment?: string;
  orderMenus: OrderSubDetailNew[];
}

export interface OrderSubDetailNew {
  menuSelected: boolean;
  priceOrder: number;
  nameMenu: string;
  displayMenu: boolean
  typeOrder: string;//Special Dessert or Side
  nameOrder: string; //Special === pre ? Menu => Either One
  idType: string;
  amountOrder: number;
  isDge?: boolean;
  isDisabled: boolean;
  allergenes?: Allergene[];
  allergenesString?: string[];
  specialOrdersPossibleMenu?: SpecialFoodOrderInterface[];
  specialFoodOrder?: SpecialFoodOrderInterface[];
  nameLabelExist?: boolean;
  idMenu: (string | null);
  allergensPerMeal?: { nameMeal: string, allergenes: Allergene[] }[];
}
export class OrderClassStudent implements OrderInterfaceStudent {
  studentId: (string | undefined);
  kw: number;
  year: number;
  order: OrderInterfaceStudentDay;
  dateOrder: string; // Format: 'YYYY-MM-DD'
  customerId: string;
  _id?: string;
  orderId?: string;
  groupIdCustomer: string;
  userId?: string;
  isBut: boolean = false;
  constructor(customer: CustomerInterface,
    query: { week: number, year: number },
    settings: SettingInterfaceNew,
    selectedWeek: WeekplanDayInterface,
    studentModel: (StudentInterface | null)
    , dateOrder: string, // Format: 'YYYY-MM-DD'
    contractSettings: EinrichtungInterface) {
    this.order = new OrderModelSingleDayStudent(customer, settings, selectedWeek, studentModel, contractSettings);
    this.customerId = customer.customerId;
    this.dateOrder = dateOrder;
    this.kw = query.week;
    this.year = query.year;
    if (studentModel) {
      this.studentId = studentModel._id;
    }
    this.groupIdCustomer = this.getSubgroupStudent(studentModel, customer);

  }
  getSubgroupStudent(studentModel: StudentInterface | null, customer: CustomerInterface): string {
    if (!studentModel) return '';
    if (studentModel && studentModel.subgroup && studentModel.subgroup.length > 0) return studentModel.subgroup;
    return customer.order.split[0].group;
  }
}
function getPriceBasedOnSettingsBrutto(price: number, tax: number, customer: CustomerInterface): number {
  let newPrice = price;
  if (!customer.billing.isBrutto) {
    newPrice = newPrice + (newPrice / 100 * tax);
  }
  return roundNumberTwoDigits(newPrice);
}


function getPriceStudentMenu(customer: CustomerInterface, studentModel: StudentInterface | null, eachSpecial: MealtypesWeekplan, contractSettings: EinrichtungInterface): number {
  let priceStudent = 0;
  if (!studentModel) return priceStudent;
  customer.billing.group.forEach(eachGroup => {
    if (eachGroup.groupId === studentModel.subgroup) {
      eachGroup.prices.forEach((eachPrice, index) => {
        if (eachPrice.idSpecial === eachSpecial.idSpecial) {
          priceStudent = getPriceBasedOnSettingsBrutto(eachPrice.priceSpecial, eachGroup.tax, customer);
          // priceStudent = roundNumberTwoDigits(eachPrice.priceSpecial + (eachPrice.priceSpecial/100* eachGroup.tax));
        }
      })
    }
  })
  if (contractSettings.whoPayCharges === 'parent') {
    priceStudent += roundNumberTwoDigits(contractSettings.amountPerOrder + (contractSettings.amountPerOrder / 100 * 19));
  }
  if (contractSettings.essensgeldEinrichtung > 0) {
    priceStudent += contractSettings.essensgeldEinrichtung;
  }
  return priceStudent;
}
class OrderModelSingleDayStudent implements OrderInterfaceStudentDay {
  comment = '';
  orderMenus: OrderSubDetailNew[] = [];

  constructor(customer: CustomerInterface,
    settings: SettingInterfaceNew,
    selectedWeek: WeekplanDayInterface,
    studentModel: (StudentInterface | null),
    contractSettings: EinrichtungInterface) {
    selectedWeek.mealTypesDay.forEach(eachSpecial => {

      let priceStudent = getPriceStudentMenu(customer, studentModel, eachSpecial, contractSettings)
      let order: OrderSubDetailNew = setOrderSplitEach(eachSpecial, customer, settings, selectedWeek, priceStudent);
      if (order) {
        this.orderMenus.push(order);
      }
    });
    if (studentModel && studentModel.specialFood && !customer.generalSettings.showAllSpecialFood) {
      let priceSpecial = getPriceSpecialFood(customer, studentModel, contractSettings);
      let specialFood = getSpecialFoodById(studentModel.specialFood, settings);
      if (!specialFood) return;
      const orderSpecial: OrderSubDetailNew = setOrderSpecialFood(priceSpecial, specialFood)
      this.orderMenus.push(orderSpecial);
    }
    if (studentModel && customer.generalSettings.showAllSpecialFood) {
      if (customer.order.showSpecialFood && customer.order.specialShow.length > 0) {
        customer.order.specialShow.forEach(eachSpecial => {
          if (eachSpecial.selected) {
            let priceSpecial = getPriceSpecialFood(customer, studentModel, contractSettings);

            let specialFood = getSpecialFoodById(eachSpecial.idSpecialFood, settings);
            if (!specialFood) return;
            const orderSpecial: OrderSubDetailNew = setOrderSpecialFood(priceSpecial, specialFood)
            this.orderMenus.push(orderSpecial);
          }
        })
      }
    }
  }
}
function getPriceSpecialFood(customer: CustomerInterface, studenModel: StudentInterface, contractSettings: EinrichtungInterface): number {
  let price = 0;
  let backupPrice: number = 0;
  // if (customer.billing.separatePrice) {
  customer.billing.group.forEach(eachGroup => {
    if (eachGroup.groupId === studenModel.subgroup) {
      eachGroup.prices.forEach((eachPrice, index) => {
        if (eachPrice.typeSpecial === 'special') {
          price = getPriceBasedOnSettingsBrutto(eachPrice.priceSpecial, eachGroup.tax, customer);
          // price = roundNumberTwoDigits(eachPrice.priceSpecial + (eachPrice.priceSpecial/100* eachGroup.tax));
        }
      })
    }
  })
  // } else {
  //   customer.billing.group.forEach(eachPrice => {
  //     console.log('eachPrice', eachPrice);
  //     if (eachPrice.groupId === studenModel.subgroup) {
  //       price = getPriceBasedOnSettingsBrutto(eachPrice.prices[0].priceSpecial, eachPrice.tax, customer);
  //       price = eachPrice.prices[0].priceSpecial
  //     }
  //   })
  // }
  if (contractSettings.whoPayCharges === 'parent') {
    price += roundNumberTwoDigits(contractSettings.amountPerOrder + (contractSettings.amountPerOrder / 100 * 19));

  }
  if (contractSettings.essensgeldEinrichtung > 0) {
    price += contractSettings.essensgeldEinrichtung;
  }
  return price;
}
function setOrderSpecialFood(priceStudent: number, specialFood: SpecialFoodInterface): OrderSubDetailNew {
  let order: OrderSubDetailNew = {
    menuSelected: false,
    priceOrder: priceStudent,
    nameMenu: specialFood.nameSpecialFood,
    displayMenu: true,
    isDge: false,
    typeOrder: 'specialFood',
    nameOrder: specialFood.nameSpecialFood,
    idType: specialFood._id,
    amountOrder: 0,
    idMenu: null,
    nameLabelExist: false,
    specialFoodOrder: [],
    isDisabled: false,
  };
  order.allergenes = []
  order.allergensPerMeal = []
  return order;
}

function displayMenuForStudent(typeSpecial: string, settings: SettingInterfaceNew): boolean {
  if (settings.orderSettings.showDessertIfNotSeparate && typeSpecial === 'dessert') return false
  if (settings.orderSettings.showSideIfNotSeparate && typeSpecial === 'side') return false
  return true;
}

export function getPriceOrderPlaced(orderStudent: OrderInterfaceStudent): number {
  let price = 0;
  orderStudent.order.orderMenus.forEach(eachOrder => {
    if (eachOrder.amountOrder > 0) price += eachOrder.priceOrder * eachOrder.amountOrder;
  })
  return price;
}
function setOrderSplitEach(eachSpecial: MealtypesWeekplan,
  customer: CustomerInterface,
  settings: SettingInterfaceNew,
  selectedWeek: WeekplanDayInterface, priceStudent: number): OrderSubDetailNew {
  // if (eachSpecial.typeSpecial === 'side' && !settings.orderSettings.sideOrderSeparate) {
  //   return null;
  // }
  // if (eachSpecial.typeSpecial === 'dessert' && !settings.orderSettings.dessertOrderSeparate) {
  //   return null;
  // }
  let order: OrderSubDetailNew = {
    menuSelected: false,
    priceOrder: priceStudent,
    nameMenu: eachSpecial.nameSpecial,
    displayMenu: displayMenuForStudent(eachSpecial.typeSpecial, settings), //Shows Menu (Side,Dessert) Depending on Settings
    isDge: eachSpecial.isDge,
    typeOrder: eachSpecial.typeSpecial,
    nameOrder: getNameLabelOrderOverview0(eachSpecial, selectedWeek),
    idType: eachSpecial.idSpecial,
    amountOrder: 0,
    idMenu: getMenuIdOrderOverview(eachSpecial, selectedWeek),
    nameLabelExist: doesNameLabelExist(eachSpecial, selectedWeek),
    specialFoodOrder: getSpecialOrdersPossibleMenu(eachSpecial, settings, customer),
    isDisabled: getLockInputOrderOverview(selectedWeek, eachSpecial),
  };
  order.allergenes = getAllergensOrderOverviewMenuO(order, selectedWeek)
  order.allergensPerMeal = getAllergensPerMealOrderOverviewMenuO(order, selectedWeek);
  return order;
}



function getAllergensPerMealOrderOverviewMenuO(special: OrderSubDetailNew,
  weekplan: WeekplanDayInterface): { nameMeal: string, allergenes: Allergene[] }[] {
  let arrayOfAllergenes: { nameMeal: string, allergenes: Allergene[] }[] = [];
  // if (!weekplan || indexDay === -1 || indexDay === 5) {
  //   return [];
  // }
  weekplan.mealTypesDay.forEach(eachMealType => {
    if (eachMealType.idSpecial === special.idType) {
      if (!eachMealType.menu || !eachMealType.menu.recipe) {
        return
      }
      eachMealType.menu.recipe.forEach(eachRecipe => {
        if (!eachRecipe) return;
        arrayOfAllergenes.push({
          nameMeal: eachRecipe.nameMeal,
          allergenes: getAllergenesPerRecipe(eachRecipe)
        });
      })
    }
  });
  return arrayOfAllergenes;
}

function doesNameLabelExist(special: MealtypesWeekplan, weekplan: WeekplanDayInterface): boolean {
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
function getMenuIdOrderOverview(special: MealtypesWeekplan, weekplan: WeekplanDayInterface): (string | null) {
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
function getNameLabelOrderOverview0(special: MealtypesWeekplan, weekplan: WeekplanDayInterface): string {
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

function getLockInputOrderOverview(weekplan: WeekplanDayInterface, special: MealtypesWeekplan): boolean {
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


function getSpecialOrdersPossibleMenu(orderDayGroup: MealtypesWeekplan, setting: SettingInterfaceNew, customer: CustomerInterface): SpecialFoodOrderInterface[] {
  let arraySpecial: SpecialFoodOrderInterface[] = [];
  if (orderDayGroup.typeSpecial === 'side' && !setting.orderSettings.specialShowSideIfShowMenu) return arraySpecial
  if (orderDayGroup.typeSpecial === 'dessert' && !setting.orderSettings.specialShowDessertIfShowMenu) return arraySpecial
  if (!orderDayGroup.menu) {
    return setSpecialArrayNoWeekplanExist(setting, customer, orderDayGroup);
  }
  setting.orderSettings.specialFoods.forEach((specialFood) => {
    if (specialFoodShownCustomer(specialFood, customer) && specialFoodIsInAllergies(specialFood, orderDayGroup.allergenes)) {
      arraySpecial.push({
        menuSelected: false,
        priceOrder: 0,
        nameSpecialFood: specialFood.nameSpecialFood,
        idSpecialFood: specialFood._id || '',
        amountSpecialFood: 0,
        active: true,
      });
    } else {
      arraySpecial.push({
        menuSelected: false,
        priceOrder: 0,
        nameSpecialFood: specialFood.nameSpecialFood,
        idSpecialFood: specialFood._id || '',
        amountSpecialFood: 0,
        active: false,
      });
    }
  });
  return removeDuplicatesSpecialFood(arraySpecial);
}

function getAllergensOrderOverviewMenuO(special: OrderSubDetailNew, weekplan: WeekplanDayInterface): Allergene[] {
  let allergenen: Allergene[] = [];
  // if (!weekplan || indexDay === -1 || indexDay === 5) {
  //   return allergenen;
  // }
  weekplan.mealTypesDay.forEach(eachMealType => {
    if (eachMealType.idSpecial === special.idType) {
      if (!eachMealType.menu) {
        return;
      }
      allergenen = calculateAllergenesMenu(eachMealType.menu);
    }
  });
  return allergenen;
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

function specialFoodShownCustomer(specialFood: SpecialFoodInterface, customer: CustomerInterface): boolean {
  let show = false;
  customer.order.specialShow.forEach((specialFoodCustomer) => {
    if (specialFoodCustomer.idSpecialFood === specialFood._id && specialFoodCustomer.selected) {
      show = true;
    }
  });
  return show;
}

function specialFoodIsInAllergies(specialFood: SpecialFoodInterface, allergenes: Allergene[]): boolean {
  if (!allergenes) return false;
  for (let i = 0; i < specialFood.allergenes.length; i++) {
    for (let i2 = 0; i2 < allergenes.length; i2++) {
      if (specialFood.allergenes[i] === allergenes[i2]._id) {
        return true;
      }
    }
  }
  return false;
}

function setSpecialArrayNoWeekplanExist(setting: SettingInterfaceNew, customer: CustomerInterface, orderDayGroup: MealtypesWeekplan): SpecialFoodOrderInterface[] {
  let arraySpecial: SpecialFoodOrderInterface[] = [];
  setting.orderSettings.specialFoods.forEach((specialFood) => {
    let specialFoodOrder = {
      isShownCustomer: specialFoodShownCustomer(specialFood, customer),
      nameSpecialFood: specialFood.nameSpecialFood,
      idSpecialFood: specialFood._id || '',
      amountSpecialFood: 0,
      active: false,
      priceOrder: 0,
      menuSelected: false,
    }
    if (specialFoodShownCustomer(specialFood, customer) && setting.orderSettings.showMenuWithoutName) {
      specialFoodOrder.active = true;
    }
    arraySpecial.push(specialFoodOrder);
  });
  return arraySpecial;
}


function getSpecialOrdersSubGroup(setting: SettingInterfaceNew,
  customer: CustomerInterface): SpecialFoodOrderInterface[] {
  let arraySpecial: SpecialFoodOrderInterface[] = [];
  setting.orderSettings.specialFoods.forEach(specialFood => {
    // if(!specialFood)return
    let obj: SpecialFoodOrderInterface = {
      menuSelected: false,
      priceOrder: 0,
      nameSpecialFood: specialFood.nameSpecialFood,
      idSpecialFood: specialFood._id || '',
      amountSpecialFood: 0,
      active: false,
    }
    // if (!specialFoodShownCustomer(specialFood, customer)) {
    //   obj.active = false;
    // }
    arraySpecial.push(obj)
  });
  return arraySpecial
}

function calculateAllergenesMenu(menu: MenuInterface): Allergene[] {
  let allergens: Allergene[] = [];
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

function removeDuplicatesMenuAllergene(allergens: Allergene[]): Allergene[] {
  const uniqueAllergens = allergens.filter((allergen, index, self) => {
    return index === self.findIndex(a => a.name_allergene === allergen.name_allergene);
  });

  return uniqueAllergens;
}


export function getAllergenesPerRecipe(recipe: MealModelInterface): Allergene[] {
  let allergenes: Allergene[] = [];
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
