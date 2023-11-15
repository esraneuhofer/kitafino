import {MealModelInterface} from './meal.interface';
import {ArticleInterface} from './article.interface';

export interface MenuInterfaceWithRecipes{
  _id?:string;
  nameMenu:string;
  recipe:MealModelInterface[];
}

export interface MenuInterface {
  _id?:string;
  nameMenu: string,
  recipe: MealModelInterface[],
}
export interface MenuInterfaceId extends MenuInterface{
  _id:string;
}

export interface GroupTypeMealInterface { groupTypeId: string, amount: number,_id:string }
export interface RecipeMealInterface {_id:string,amountArticle: number, price: number,isEdited:boolean,article:ArticleInterface}
