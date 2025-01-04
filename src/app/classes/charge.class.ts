import {TenantStudentInterface} from "./tenant.class";
import {AccountCustomerInterface} from "./account.class";

export interface AccountChargeInterface {
  approved: boolean,
  dateApproved: Date | null;
  amount: number;
  datePaymentReceived: Date;
  accountHolder: string;
  iban: string;
  reference: string;
  typeCharge:'einzahlung' | 'auszahlung';
  typeChargeName: 'but' | 'bankeinzahlung_auto' | 'bankeinzahlung_manuell' | 'auszahlung_but' | 'auszahlung_bank'| 'stripe_einzahlung' | 'sonstige'
  tenantId: string;
  transactionId: string;
  username:string;
  userId: string;
  customerId: string;
  emailTenant?: string;

}
export class ChargeAccountInterface implements AccountChargeInterface {
  approved: boolean = false;
  username = '';
  reference = '';
  dateApproved = new Date();
  amount = 0;
  datePaymentReceived = new Date();
  accountHolder = '';
  iban = '';
  typeCharge:'einzahlung' | 'auszahlung' = 'einzahlung';
  typeChargeName: 'but' | 'bankeinzahlung_auto' | 'bankeinzahlung_manuell' | 'auszahlung_but' | 'auszahlung_bank'| 'stripe_einzahlung' | 'sonstige' = 'bankeinzahlung_manuell';
  tenantId = '';
  userId = '';
  customerId = '';
  transactionId = '';
  constructor(
    tenantStudent: TenantStudentInterface,
    type:'einzahlung' | 'auszahlung',
    approved:boolean,
    reference:string,
    amount:number,
    typeChargeName: 'but' | 'bankeinzahlung_auto' | 'bankeinzahlung_manuell' | 'auszahlung_but' | 'auszahlung_bank' | 'stripe_einzahlung' | 'sonstige') {
    this.approved = approved;
    this.username = tenantStudent.username;
    this.reference = reference;
    this.amount =amount

    this.accountHolder = tenantStudent.firstName + ' ' + tenantStudent.lastName;
    this.typeCharge = type;
    if(tenantStudent.tenantId){
      this.tenantId = tenantStudent.tenantId;
    }
    this.typeChargeName = typeChargeName;

    if(tenantStudent.userId){
      this.userId = tenantStudent.userId;
    }
    if(tenantStudent.customerId){
      this.customerId = tenantStudent.customerId;
    }
    if(tenantStudent.iban){
      this.iban = tenantStudent.iban;
    }
    this.dateApproved = new Date()
    this.transactionId = generateTransactionIdAccountCharge(tenantStudent);
    this.datePaymentReceived = new Date();

  }

}


 function generateTransactionIdAccountCharge(tenant: TenantStudentInterface): string {
  return tenant.username  + '-' + Date.now();
}
