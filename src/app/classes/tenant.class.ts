export interface TenantStudentInterface {

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  username: string;
  zip: string;
  orderSettings:{
    orderConfirmationEmail:boolean;
    sendReminderBalance:boolean;
    amountBalance:number;
    permanentOrder:boolean;
  }
}
