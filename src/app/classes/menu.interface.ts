import {MealModelInterface} from './meal.interface';
import {ArticleInterface} from './article.interface';

export interface MenuInterface {
  _id?:string;
  nameMenu: string,
  recipe: (MealModelInterface | null)[],
}

export interface GroupTypeMealInterface { groupTypeId: string, amount: number,_id:string }
export interface RecipeMealInterface {_id:string,amountArticle: number, price: number,isEdited:boolean,article:(ArticleInterface | null)}
