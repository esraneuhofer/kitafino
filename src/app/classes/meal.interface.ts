import {Allergene} from './allergenes.interface';
import {GroupTypeMealInterface, RecipeMealInterface} from './menu.interface';

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

