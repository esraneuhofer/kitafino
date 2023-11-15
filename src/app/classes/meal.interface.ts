import {GroupTypesSettingsIdInterface, OrderSettingsInterfaceNew} from './setting.class';
import {Allergene} from './allergenes.interface';
import {GroupTypeMealInterface, RecipeMealInterface} from './menu.interface';

export interface Meal {
  tenantId:string;
  nameMeal: string;
  mealtype: string;
  allergens:[];
  totalAmount: number;
  type: string;
  preparation: string;
  recipe: [{article:string,amountArticle:number,price:number}];
  calculation: string;
  portionSizeGroupType: [{
    groupTypeId: string,
    amount: number
  }];
}
export interface MealModelInterface {
  _id?:string;
  groupRaiseAmount:{customerId:string,groupId:string,amount:number}[];
  tenantId: string;
  nameMeal: string;
  totalAmount: number;
  type: string;
  mealtype:string;
  preparation: string;
  allergens: Allergene[];
  recipe: RecipeMealInterface[];
  specials: {};
  portionSizeGroupType: GroupTypeMealInterface [];
  calculation: string;
}

