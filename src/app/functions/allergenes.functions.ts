import {Allergene} from "../classes/allergenes.interface";

export function atLeastOneAllergene(order: any): boolean {
  if(!order || !order.allergenes || order.allergenes.length === 0)return false;
  for (let i = 0; i < order.allergenes.length; i++) {
    if (order.allergenes[i].display) {
      return true;
    }
  }
  return false;
}

export function getTooltipContent(allergens: Allergene[] | undefined): string {
  if(!allergens) return 'Keine Allergene enthalten';
  // Get an array of name_allergene from each allergen object
  let allergenNames = allergens.map(allergen => allergen.name_allergene);
  if (allergenNames.length === 0) {
    return 'Keine Allergene enthalten'
  }
  return `Enthält: ${allergenNames.join(', ')}`;
}

export function getAllergenes(allergenes:Allergene[] | undefined){
  if(!allergenes) return '';
  return allergenes.map(eachAllergene => eachAllergene.short).join(', ')
}
