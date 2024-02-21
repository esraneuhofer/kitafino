import {CustomerInterface} from "../classes/customer.class";
import {SettingInterfaceNew, SpecialFoodInterface} from "../classes/setting.class";
import {SpecialFoodOrderInterface} from "../classes/order_student.class";

export interface SpecialFoodSelectionStudent{
  nameSpecialFood:string,
  idSpecialFood:string,
  selected:boolean
}

export function getSpecialFoodById(idSpecialFood:string,settings:SettingInterfaceNew):SpecialFoodInterface | null{
  return settings.orderSettings.specialFoods.find(eachSpecial => eachSpecial._id === idSpecialFood) || null;
}
export function getSpecialFoodSelectionCustomer(customer:CustomerInterface,settings:SettingInterfaceNew):SpecialFoodSelectionStudent[]{
  let array:SpecialFoodSelectionStudent[] = [];
  customer.order.specialShow.forEach(eachSpecialFood=>{
    if(eachSpecialFood.selected){
      const specialFood = getSpecialFoodById(eachSpecialFood.idSpecialFood,settings);
      if(!specialFood)return;
      array.push({
        nameSpecialFood:specialFood.nameSpecialFood,
        idSpecialFood:eachSpecialFood.idSpecialFood,
        selected:false
      })
    }

  })
  // if(array.length > 0){
  //   array.push({
  //     nameSpecialFood:'Kein Sonderessen',
  //     idSpecialFood:'none',
  //     selected:false
  //   })
  // }
  return array;
}
