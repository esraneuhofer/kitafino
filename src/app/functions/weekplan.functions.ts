import {Allergene} from "../classes/allergenes.interface";
import {MealModelInterface} from "../classes/meal.interface";
import {getWeekplanModel, MealtypesWeekplan, WeekplanMenuInterface} from "../classes/weekplan.interface";
import {MenuInterface} from "../classes/menu.interface";
import {SettingInterfaceNew} from "../classes/setting.class";
import {getMenuFromId} from "./meal.functions";
import {getAllergenesPerRecipe} from "../classes/order_student.class";
export interface QueryInterOrderInterface {
  week: number,
  year: number
}
export function setAllergensMeal(meal:MealModelInterface, articleDeclaration: Allergene[]): MealModelInterface {
  meal.allergens = [];
  meal.recipe.forEach((eachArticle, indexArticle) => {
    if (eachArticle.article && eachArticle.article.allergenes && eachArticle.article.allergenes.length > 0) {
      eachArticle.article.allergenes.forEach((eachAllergen, indexAllergen) => {
        let allergeneFound = findAllergenFromId(eachAllergen, articleDeclaration)
        if(allergeneFound){
          meal.allergens.push(allergeneFound);
        }
      });
    }
  });
  return meal;
}

export function findAllergenFromId(eachAllergen:{_id:string,name_allergene:string}, articleDeclaration:Allergene[]):(Allergene | null) {
  for (let i = 0; i < articleDeclaration.length; i++) {
    if (eachAllergen._id === articleDeclaration[i]._id) {
      return articleDeclaration[i];
    }
  }
  return null;
}


export function getMenusForWeekplan(weekplan: WeekplanMenuInterface, menus: MenuInterface[], settings: SettingInterfaceNew,query:QueryInterOrderInterface):WeekplanMenuInterface {
  if (!weekplan) {
    return getWeekplanModel(settings, query);
  }
  let weekplan$:WeekplanMenuInterface = JSON.parse(JSON.stringify(weekplan));
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
      // eachType.allergenes = calculateAllergenesMenu(menu);
      // eachType.allergenesCalculated = calculateAllergenesMenuByInput(menu, settings);
      eachType.allergensPerMeal =  setAllergenesRecipeMenu(eachType);
    });
  });
  return weekplan$;
}


export function setAllergenesRecipeMenu(selectedMenuType:MealtypesWeekplan):{nameMeal:string,allergenes:Allergene[]}[]{
  let arrayRecipes:{nameMeal:string,allergenes:Allergene[]} []= [];
  if(selectedMenuType.menu) {
    selectedMenuType.menu.recipe.forEach(eachRecipe => {
      if (!eachRecipe) return;
      arrayRecipes.push({
        nameMeal:eachRecipe.nameMeal,
        allergenes:getAllergenesPerRecipe(eachRecipe)
      });
    })
  }
  return arrayRecipes;
}
