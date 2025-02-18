
export interface OrderInterfaceStudentSave {
  userId?:string;
  orderId?:string;
  _id?:string;
  studentId:string;
  kw: number;
  year: number;
  dateOrderPlaced:string;
  dateOrder: string;
  customerId: string;
  order:OrderInterfaceStudentDaySafe
  isBut:boolean;
}

export interface OrderInterfaceStudentDaySafe {
  comment?: string;
  orderMenus: OrderSubDetailNewSafe[];
  specialFoodOrder: SpecialFoodOrderInterfaceSafe[];
}

interface OrderSubDetailNewSafe {
  menuSelected:boolean;
  typeOrder: string;
  nameOrder: string; //Special === pre ? Menu => Either One
  idType: string;
  amountOrder: number;
  idMenu: (string |null);
  priceOrder:number
}
export interface SpecialFoodOrderInterfaceSafe {
  idSpecialFood: string,
  amountSpecialFood: number
  priceOrder:number
  nameSpecialFood:string,
  menuSelected:boolean
}
