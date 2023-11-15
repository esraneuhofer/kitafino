export interface SpecialsHiddenInterface {idSpecial:string,nameSpecial:string,selected:boolean}
export interface SpecialsShow {idSpecialFood:string,nameSpecialFood:string,selected:boolean}

export interface CustomerInterface {
  customerId:string;
  _id?:string;
  // tenantId: Schema.Types.ObjectId,
  // customerId: Schema.Types.ObjectId,
  active:boolean;
  order: {
    deliveryTime: Date;
    permanentOrder: boolean;
    showSpecialFood:boolean;
    hideExtra:boolean;
    specialsHidden:SpecialsHiddenInterface[],
    specialShow:SpecialsShow[],
    addSubgroupsOrder:boolean;
    split: CustomerOrderSplit[],
    // orderCycle:{type:string;required:'{PATH} is required!'},
    dessert: boolean;
    ignoreMinOrder:boolean,
    sidedish:boolean;
    showExtraOrder:boolean;  },
  settings: {
    firstAccess: boolean;
    substitute: boolean;
    remarks:string;
    state:string;  },
  billing: {
    headingInvoice: {heading:string}[],
    group: [{
      tax:string;
      pricePortion:number
    }],
    invoiceCycle: string;
    customerNumber: string;
    paymentMethod: boolean;
    separateBilling: boolean;
    grossPrice:boolean;
    iban:string;
  },
  contact: {
    customer: string;
    street: string;
    zipcode: string;
    contactPerson: string;
    phone: string;
    fax: string;
    secondEmail:string;
    email: string;

  }
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
