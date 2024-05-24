export interface TenantStudentInterface {
  firstAccess: boolean;
  _id?: string;
  userId?: string;
  tenantId?:string,
  customerId?:string,
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  username: string;
  iban?: string;
  zip: string;
  orderSettings:{
    orderConfirmationEmail:boolean;
    displayTypeOrderWeek:boolean
    sendReminderBalance:boolean;
    amountBalance:number;
    permanentOrder:boolean;
  }
}
