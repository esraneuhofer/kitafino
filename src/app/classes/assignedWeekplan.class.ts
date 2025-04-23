import {WeekplanMenuInterface} from "./weekplan.interface";
import {CustomerInterface} from "./customer.class";
import {SettingInterfaceNew} from "./setting.class";
export interface WeekplanGroupClass{
  _id?:string,
  groups:{nameCustomer:string,customerId:string}[]
  nameWeekplanGroup:string
}

// Interface für die Customer-Gruppe
export interface GroupWeekplanGroupSelection {
  nameCustomer: string;
  customerId: string; // ObjectId als String für Frontend
}

// Interface für die erlaubten Auswahlen
export interface WeekplanGroupAllowedSelection {
  idSpecial: string;
  selected: boolean;
}

// Hauptinterface für das WeekplanGroupSelection-Objekt
export interface WeekplanGroupSelection {
  _id?: string; // Optional, falls benötigt
  tenantId: string; // ObjectId als String für Frontend
  groupsWeekplanGroupSelection: GroupWeekplanGroupSelection[];
  nameWeekplanGroupSelection: string;
  weekplanGroupAllowedSelection: WeekplanGroupAllowedSelection[];
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

function setWeekplangroupSelection(assignedWeekplan:AssignedWeekplanInterface,weekplanGroupsSelection:WeekplanGroupSelection):AssignedWeekplanInterface{
  if(!weekplanGroupsSelection) return assignedWeekplan;
  assignedWeekplan.weekplanGroupAllowed.forEach(weekplanGroup=>{
    weekplanGroup.selectedMealsDay.forEach(mealType=>{
      let weekplanGroupSelection = weekplanGroupsSelection.weekplanGroupAllowedSelection.find(weekplanGroupSelection=>weekplanGroupSelection.idSpecial === mealType.idSpecial);
      if(weekplanGroupSelection){
        mealType.selected = weekplanGroupSelection.selected;
      }
    });
  });
  return assignedWeekplan;
}

export function setWeekplanModelGroups(weekplan: WeekplanMenuInterface,
                                       dateQuery: { week: number, year: number },
                                       assignedWeekplans: AssignedWeekplanInterface[],
                                       customerInfo: CustomerInterface,
                                       weekplanGroups:WeekplanGroupClass[],
                                       settings:SettingInterfaceNew,
                                      weekplanGroupsSelection:WeekplanGroupSelection): AssignedWeekplanInterface {
                                        console.log('weekplanGroupsSelection', JSON.parse(JSON.stringify(weekplanGroupsSelection)));
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
  weekplanModelGroups = setWeekplangroupSelection(weekplanModelGroups,weekplanGroupsSelection);
  console.log('weekplanModelGroups', JSON.parse(JSON.stringify(weekplanModelGroups)));
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

function setNewAssignedWeekplan(weekplan: WeekplanMenuInterface,
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

function setEmptyAsignedWeekplan(weekplan: WeekplanMenuInterface, weekplanModelGroups: AssignedWeekplanInterface,settings:SettingInterfaceNew): AssignedWeekplanInterface {
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
