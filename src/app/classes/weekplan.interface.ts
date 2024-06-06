import {MenuInterface} from "./menu.interface";
import {SettingInterfaceNew} from "./setting.class";
import {Allergene} from "./allergenes.interface";
import {QueryInterOrderInterface} from "../functions/weekplan.functions";
export const numberFive = [
  [0, 'Montags'],
  [1, 'Dienstag'],
  [2, 'Mittwoch'],
  [3, 'Donnerstag'],
  [4, 'Freitag']
];
export const dayArray: any = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

export interface OrderOverViewOrderInterface {
  queryYears: number,
  queryCW: number,
}

export interface WeekplanDayInterface {
  nameDay:string,
  mealTypesDay:MealtypesWeekplan[]
}
export interface WeekplanMenuInterface {
  _id?:string,
  weekplan:WeekplanDayInterface[]
  week:number,
  year:number,
  allowOneMenuEachDay:boolean[]
}
export interface MealtypesWeekplan {
  isDge?:boolean,
  allergenesCalculated?:string[],
  typeSpecial:string,
  idSpecial:string,
  nameSpecial:string,
  menu:(MenuInterface | null),
  idMenu:(string | null),
  allergensPerMeal?:{nameMeal:string,allergenes:Allergene[]}[],
  allergenes:Allergene[]}

export function getAllowOneMenuEachDay(setting:SettingInterfaceNew):boolean[]{
  let arr:boolean[] = [];
  numberFive.forEach((each, index) => {
    arr.push(setting.orderSettings.onlyOneMenuSelectable)
  });
  return arr;
}

export function getWeekplanModel(setting:SettingInterfaceNew,dateQuery:QueryInterOrderInterface):WeekplanMenuInterface {
  return{
    year:dateQuery.year,
    week:dateQuery.week,
    weekplan:getWeekplanArray(setting),
    allowOneMenuEachDay:getAllowOneMenuEachDay(setting),
  }
}

export function getWeekplanArray(setting:SettingInterfaceNew):WeekplanDayInterface[]{
  let arr:WeekplanDayInterface[] = [];
  numberFive.forEach((each, index) => {
    arr.push({
      nameDay:dayArray[index],
      mealTypesDay:getMealTypesForWeekplan(setting)
    })
  });
  return arr;
}

function getMealTypesForWeekplan(setting:SettingInterfaceNew):MealtypesWeekplan[]{
  let arr:MealtypesWeekplan[] = [];
  let order = ['side','menu','special','dessert']
  order.forEach(each =>{
    setting.orderSettings.specials.forEach(eachSpecial =>{
      if(eachSpecial.typeOrder === each){
        arr.push({typeSpecial:eachSpecial.typeOrder,idSpecial:eachSpecial._id,nameSpecial:eachSpecial.nameSpecial,menu:null,idMenu:null,allergenes:[]})
      }
    })
  })
  return arr;
}
