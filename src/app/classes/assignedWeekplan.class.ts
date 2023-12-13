import {WeekplanMenuInterface} from "./weekplan.interface";
import {CustomerInterface} from "./customer.class";
import {SettingInterfaceNew} from "./setting.class";
export interface WeekplanGroupClass{
  _id?:string,
  groups:{nameCustomer:string,customerId:string}[]
  nameWeekplanGroup:string
}

export interface AssignedWeekplanInterface {
  _id?: string;
  weekplanId: string;
  weekplanGroupId: string
  tenantId: string;
  week: number,
  year: number,
  weekplanGroupAllowed: WeekplanModelGroupsAllowedInterfaceDay[]
}

export interface WeekplanModelGroupsAllowedInterfaceDay {
  selectedMealsDay: { idSpecial: string, selected: boolean }[];
}

export function setWeekplanModelGroups(weekplan: WeekplanMenuInterface,
                                       dateQuery: { week: number, year: number },
                                       assignedWeekplans: AssignedWeekplanInterface[],
                                       customerInfo: CustomerInterface,
                                       weekplanGroups:WeekplanGroupClass[],settings:SettingInterfaceNew): AssignedWeekplanInterface {
  let weekplanModelGroups: AssignedWeekplanInterface = setNewAssignedWeekplan(weekplan, dateQuery);
  if (!weekplan) {
    return weekplanModelGroups;
  }
  weekplanModelGroups = setEmptyAsignedWeekplan(weekplan, weekplanModelGroups,settings);
  assignedWeekplans.forEach(assignedWeekplan => {
    let weekplanGroup = weekplanGroups.find(weekplanGroup => weekplanGroup._id === assignedWeekplan.weekplanGroupId);
    if(!weekplanGroup)return;
    if (assignedWeekplan.weekplanId === weekplan._id && groupIsInWeekplanGroup(weekplanGroup,customerInfo)){
      weekplanModelGroups = assignedWeekplan;
    }
  });
  return weekplanModelGroups;

}

function groupIsInWeekplanGroup(weekplanGroup:WeekplanGroupClass,customerInfo:CustomerInterface):boolean{
  let isInGroup = false;
  weekplanGroup.groups.forEach(group=>{
    if(group.customerId === customerInfo.customerId){
      isInGroup = true;
    }
  });
  return isInGroup;
}

export function setNewAssignedWeekplan(weekplan: WeekplanMenuInterface,
                                       dateQuery: { week: number, year: number }):AssignedWeekplanInterface {
  return {
    tenantId: '',
    weekplanId: weekplan._id || '' ,
    weekplanGroupId: '',
    week: dateQuery.week,
    year: dateQuery.year,
    weekplanGroupAllowed: []
  };
}

export function setEmptyAsignedWeekplan(weekplan: WeekplanMenuInterface, weekplanModelGroups: AssignedWeekplanInterface,settings:SettingInterfaceNew): AssignedWeekplanInterface {
  let weekplanModelGroups$ = weekplanModelGroups;

  weekplan.weekplan.forEach((day, indexDay) => {
    weekplanModelGroups$.weekplanGroupAllowed[indexDay] = {
      selectedMealsDay: []
    };
    day.mealTypesDay.forEach((mealType, indexMealType) => {
      weekplanModelGroups$.weekplanGroupAllowed[indexDay].selectedMealsDay.push({
        idSpecial: mealType.idSpecial,
        selected: true //getSelectionBasedOnSettings(mealType,settings) => Settings Not Needed but keeping to testing
      });
    });
  });
  return weekplanModelGroups$;
}
