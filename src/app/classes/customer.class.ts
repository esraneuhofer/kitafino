

interface SpecialsShow {idSpecialFood:string,nameSpecialFood:string,selected:boolean}
interface GroupBillingInterface{
  groupId:string,
  idGroupType:string,
  displayNameBilling:string,
  tax:number,
  individualPricing:boolean,
  prices:PricesGroupBillingInterface[]
}
interface PricesGroupBillingInterface{priceSpecial:number,idSpecial:string, nameSpecial?:string,typeSpecial:string}

export interface CustomerInterface {
  username?:string;
  generalSettings:GeneralSettingsInterface;
  customerId:string;
  _id?:string;
  // tenantId: Schema.Types.ObjectId,
  // customerId: Schema.Types.ObjectId,
  active:boolean;
  order:CustomerOrderInterface
  settings:CustomerSettingsInterface
  billing:CustomerBillingInterface
  contact: CustomerContactInterface
}

interface CustomerOrderInterface {
  individualPricing:boolean;
  deliveryTime: Date;
  permanentOrder: boolean;
  showSpecialFood:boolean;
  hideExtra:boolean;
  specialShow:SpecialsShow[],
  addSubgroupsOrder:boolean;
  split: CustomerOrderSplit[],
  // orderCycle:{type:string;required:'{PATH} is required!'},
  dessert: boolean;
  ignoreMinOrder:boolean,
  sidedish:boolean;
  showExtraOrder:boolean;  }
interface CustomerSettingsInterface {
  firstAccess: boolean;
  substitute: boolean;
  remarks:string;
  state:string;  }
interface CustomerBillingInterface {
  headingInvoice: { heading: string }[],
  group: GroupBillingInterface[],
  customerNumber: string;
  paymentMethod: boolean;
  separateBilling: boolean;
  separatePrice?: boolean;
  iban: string;
  bic?: string;
  addressCustomer?: string;
  city?: string;
  postalCode?: string;
  isEinzug?: boolean;
  dueDateDays?: number;
  mandateReference?: string;
  isBrutto: boolean;
}
interface CustomerContactInterface{
  customer: string;
  street: string;
  zipcode: string;
  contactPerson: string;
  phone: string;
  fax: string;
  secondEmail:string;
  email: string;
}

interface CustomerOrderSplit{
  displayGroup:string;
  group:string;
  raisePortion:any,
  idGroupType:string;
}


export interface GeneralSettingsInterface {
  subGroupSettingTenant: boolean; // Decides if the tenant has the ability to set subgroups if false the subgroups are set by the Customer/Einrichtung
  allergiesSetByTenant: boolean; // Decides if the tenant has the ability to set allergies if false the allergies are set by the Customer/Einrichtung
  showAllSpecialFood: boolean;
  showOrderDaily: boolean; // Decides if the tenant chooses each day for the order with input:Date or per week with selectField
  isDeadlineDaily: boolean; // Decides if the tenant has a daily deadline for the order
  isDeadlineWeekly: boolean; // Decides if the tenant has a weekly deadline for the order
  sendEmailOrderAfterDeadline: boolean;
  deadlineWeekly: {
    weeks: string;
    day: string;
    time: string;
  };
  deadlineDaily: DeadlineDailyInterface;
  cancelOrderDaily:DeadlineDailyInterface;
  state: string;
  hideMenuName: boolean;
  allowOnlyOneMenu: boolean; // Wenn aktiviert kann man Nur ein Menü auswählen. Bei der Auswahl eines Allergiker Essens wird das normale Menü abgewählt
}

export interface DeadlineDailyInterface{
  day: string;
  time: string;
}
