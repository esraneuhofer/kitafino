import {MealModelInterface} from "../classes/meal.interface";
import {ArticleInterface} from "../classes/article.interface";
import {ArticleDeclarations} from "../classes/allergenes.interface";
import {MenuInterface} from "../classes/menu.interface";
import {setAllergensMeal} from "./weekplan.functions";


export function getMealsWithArticle(meals:MealModelInterface[], articles:ArticleInterface[], articleDeclaration:ArticleDeclarations) {
  let $meals:MealModelInterface[] = meals.map(x => Object.assign({}, x));
  $meals.forEach((eachMeal, indexMeal) => {
    eachMeal.recipe.forEach((eachArticle, index) => {
      $meals[indexMeal].recipe[index].article = getArticleFromId(eachArticle._id, articles);
    });
    $meals[indexMeal] = setAllergensMeal(eachMeal, articleDeclaration.articleDeclarations);
  });
  return $meals;

}

export function getMenusWithMealsAndArticle(menus:MenuInterface[], meals:MealModelInterface[]) {
  let $menus = menus.map(x => Object.assign({}, x));
  $menus.forEach((eachMenu, indexMenu) => {
    eachMenu.recipe.forEach((eachRecipe, indexRecipe) => {
      $menus[indexMenu].recipe[indexRecipe] = getRecipeFromId(eachRecipe, meals);
    });
  });
  return $menus;
}

function getArticleFromId(id:string,array:ArticleInterface[]):(ArticleInterface | null){
  for(let i = 0; i  < array.length; i++){
    if(array[i]._id === id){
      return array[i];
    }
  }
  return null;
}
function getRecipeFromId(id:any,array:MealModelInterface[]):(MealModelInterface | null){
  for(let i = 0; i  < array.length; i++){
    if(array[i]._id === id){
      return array[i];
    }
  }
  return null
}

export function getMenuFromId(id:any,array:MenuInterface[]):(MenuInterface | null){
  for(let i = 0; i  < array.length; i++){
    if(array[i]._id === id){
      return array[i];
    }
  }
  return null
}
