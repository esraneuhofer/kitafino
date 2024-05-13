import {SettingInterfaceNew} from "./setting.class";
import {GeneralSettingsInterface} from "./general-settings.interface";


export interface SpecialsShow {idSpecialFood:string,nameSpecialFood:string,selected:boolean}
export interface GroupBillingInterface{
  groupId:string,
  idGroupType:string,
  displayNameBilling:string,
  tax:number,
  individualPricing:boolean,
  prices:PricesGroupBillingInterface[]
}
export interface PricesGroupBillingInterface{priceSpecial:number,idSpecial:string, nameSpecial?:string,typeSpecial:string}

export interface CustomerInterface {
  username?:string;
  stateHol:string
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

export interface CustomerOrderInterface {
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
export interface CustomerSettingsInterface {
  firstAccess: boolean;
  substitute: boolean;
  remarks:string;
  state:string;  }
export interface CustomerBillingInterface {
  headingInvoice: {heading:string}[],
  group: GroupBillingInterface[],
  customerNumber: string;
  paymentMethod: boolean;
  separateBilling: boolean;
  separatePrice?:boolean;
  iban:string;
}
export interface CustomerContactInterface{
  customer: string;
  street: string;
  zipcode: string;
  contactPerson: string;
  phone: string;
  fax: string;
  secondEmail:string;
  email: string;
}

export interface CustomerOrderSplit{
  displayGroup:string;
  group:string;
  raisePortion:any,
  idGroupType:string;
}

export interface RaisePortionInterface {
  dessert?: number;
  sidedish?: number;
  protein?: number;
  carbs?: number;
}
