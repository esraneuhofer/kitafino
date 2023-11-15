import {Allergene} from "../classes/allergenes.interface";
import {MealModelInterface} from "../classes/meal.interface";

export function setAllergensMeal(meal, articleDeclaration: Allergene[]): MealModelInterface {
  meal.allergens = [];
  meal.recipe.forEach((eachArticle, indexArticle) => {
    if (eachArticle.article && eachArticle.article.allergenes && eachArticle.article.allergenes.length > 0) {
      eachArticle.article.allergenes.forEach((eachAllergen, indexAllergen) => {
        meal.allergens.push(findAllergenFromId(eachAllergen, articleDeclaration));
      });
    }
  });
  return meal;
}

export function findAllergenFromId(eachAllergen, articleDeclaration) {
  for (let i = 0; i < articleDeclaration.length; i++) {
    if (eachAllergen._id === articleDeclaration[i]._id) {
      return articleDeclaration[i];
    }
  }
  return null;
}
