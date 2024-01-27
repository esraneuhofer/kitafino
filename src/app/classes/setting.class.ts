export interface SpecialOrderSettings {
  nameSpecial: string,
  _id: string,
  typeOrder: string,
  isActive: boolean,
  pricesSpecial: { groupType: string, priceSpecial: number }[]
}

export interface SpecialFoodInterface {
  _id?: string,
  nameSpecialFood: string,
  priceSpecialFood: { groupType: string, priceSpecial: number }[],
  allergenes: string[]
}
export interface SettingInterfaceNew {
  tenantId?: string;
  orderSettings: OrderSettingsInterfaceNew;
  invoiceSettings: InvoiceSettingsInterface;
  tenantSettings: TenantSettingsInterface;
}

export interface OrderSettingsDeadLineDailyInterface{
  day: number;
  time: Date;
  timeBeginn:Date;
  dayBeginn:Date;
  maxAmountRemove: number;
  maxAmountAdd: number;
}
export interface OrderSettingsInterfaceNew {
  heightCard: number;
  hideNutritionSidebar: boolean;
  onlyShowEasyView: boolean;
  sideOrDessertChoose:boolean;
  displayTypeEmailOrder: string,
  hideEmptyOrderEmail:boolean;
  showDessertIfNotSeparate:boolean;
  showSideIfNotSeparate:boolean;
  isDeadlineDaily: boolean;
  deadLineDaily:OrderSettingsDeadLineDailyInterface
  onlyOneMenuSelectable: boolean;
  showMenuWithoutName: boolean;
  specialShowDessertIfShowMenu: boolean;
  specialShowSideIfShowMenu: boolean;
  specialShowDessert: boolean;
  specialShowPerMeal: boolean;
  textEmailReminder: string;
  extraOption: [{
    nameExtra: string;
    priceExtra: Number,
    amountPerOrder: Number,
    description: string;
    active: boolean
  }];
  groupTypes: GroupTypesSettingsIdInterface[],
  specials: SpecialOrderSettings[],
  surchargeSpecialFood:boolean;
  specialFoods: SpecialFoodInterface[];
  sideOrderSeparate: boolean, // If true, sideDishes are declared in Ordersettings, if false, sideDishes are declared in CustomerModel
  dessertOrderSeparate: boolean, // If true, dessert are declared in Ordersettings, if false, dessert are declared in CustomerModel
  showRating: boolean;
  commentOption: boolean;
  confirmationEmail: string;
  customerRegEmail: string;
  customerOrderWebURL: string;
  deadlineWeekly: {
    weeks: string;
    day: string;
    time: Date;
  },
  extraOrder: {
    deadlineExtraOrder: [],
    extraOrderActive: boolean;
    minOrder: number
  }
  isMinOrder: boolean,
  minOrderAmount: number,
  isMinOrderAmountSub: boolean,
  minOrderAmountSub: number
}

export interface InvoiceSettingsInterface {
  displayInvoiceCombined: boolean;
  differentPricesMenus: boolean;
  logo: {
    filename: string;
    base64: string;
  },
  footer: {
    footerLeft: [],
    footerMiddle: [],
    footerRight: []
  },
  isEditInvoiceNumber:boolean,
  typeEdit:string // Can be either invoiceDate or customerNumber
  headingLine: string;
  header: any [],
  ccEmailAddressInvoice: string,
  emailTextPaymentReminder: string
  invoiceTextSecond: [{ invoiceText: string }],
  invoiceText: [{ invoiceText: string }],
  secondInvoiceText: boolean;
  emailTextStorno: string;
  sendEmailText: string;
  creditorIdentification: string;
  taxDisplay: string;
  invoiceNumberType: string;
}

export interface TenantSettingsInterface {
  billing: {
    testPeriodEnds: string;
    emailVerified: string;
    paymentActive: boolean;
    paymentVerified: boolean;
    customerNumber: string;
    billingPlanSelected: boolean;
    cancelSubscription: {
      cancel: boolean;
      dateCancelling: string;
    },
    dateBillingPlanSelected: string;
    billingPlan: [],
    paymentType: {
      paymentType: string;
      bank: {
        isActive: boolean;
        iban: string;
        bic: string;
        name: string;
      }
    },
    billingAddress: {
      companyName: string;
      companySecond: string;
      street: string;
      streetAddition: string;
      zipCode: string;
      city: string;
      country: string;
    },

  },
  contact: {
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string;
  },
  invoice: {
    header: [],
    invoiceTitle: string;
    footerOne: [],
    footerTwo: [],
    footerThree: []
  },
  settings: {
    showTooltip: boolean;
    firstAccess: boolean;
    stateHol: string;
  },
  twillio: {
    accountSid: string;
    authToken: string;
  }
}

export interface GroupTypesSettingsIdInterface {
  nameGroupType: string;
  undeletable: boolean,
  _id: string
}
