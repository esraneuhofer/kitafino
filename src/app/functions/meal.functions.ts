import {MealModelInterface} from "../classes/meal.interface";
import {ArticleInterface} from "../classes/article.interface";
import {ArticleDeclarations} from "../classes/allergenes.interface";
import {setAllergensMeal} from "./weekplan.functions";
import {MenuInterface} from "../classes/menu.interface";

export function getMealsWithArticle(meals:MealModelInterface[], articles:ArticleInterface[], articleDeclaration:ArticleDeclarations) {
  let $meals = meals.map(x => Object.assign({}, x));
  $meals.forEach((eachMeal, indexMeal) => {
    eachMeal.recipe.forEach((eachArticle, index) => {
      $meals[indexMeal].recipe[index].article = getObjectFromId(eachArticle._id, articles);
    });
    $meals[indexMeal] = setAllergensMeal(eachMeal, articleDeclaration.articleDeclarations);
  });
  return $meals;

}
export function getMenusWithMealsAndArticle(menus:MenuInterface[], meals:MealModelInterface[]) {
  let $menus = menus.map(x => Object.assign({}, x));
  $menus.forEach((eachMenu, indexMenu) => {
    eachMenu.recipe.forEach((eachRecipe, indexRecipe) => {
      $menus[indexMenu].recipe[indexRecipe] = getObjectFromId(eachRecipe, meals);
    });
  });
  return $menus;
}

export function getObjectFromId(id:string,array:{_id:string}[]){
  for(let i = 0; i  < array.length; i++){
    if(array[i]._id === id){
      return array[i];
    }
  }
  return null;
}
