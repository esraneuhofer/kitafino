import {TenantStudentInterface} from "./tenant.class";
import {AccountCustomerInterface} from "./account.class";

export interface AccountChargeInterface {
  approved: boolean,
  amount: number;
  date: Date;
  accountHolder: string;
  iban: string;
  reference: string;
  typeCharge:string;
  tenantId: string;
  transactionId: string;
  userId: string;
  customerId: string;
  emailTenant?: string;
}
export class ChargeAccountInterface implements AccountChargeInterface {
  approved: boolean = false;
  amount = 0;
  date = new Date();
  accountHolder = '';
  iban = '';
  reference = '';
  typeCharge = 'deposit';
  tenantId = '';
  userId = '';
  customerId = '';
  transactionId = '';
  emailTenant = '';
  constructor(
    accountTenant: AccountCustomerInterface,
    tenantStudent: TenantStudentInterface,
    type:string) {
    this.accountHolder = tenantStudent.firstName + ' ' + tenantStudent.lastName;
    this.typeCharge = type;
    this.approved = getApprovedAccountCharge(type);
    if(tenantStudent.tenantId){
      this.tenantId = tenantStudent.tenantId;
    }
    if(tenantStudent.userId){
      this.userId = tenantStudent.userId;
    }
    if(tenantStudent.customerId){
      this.customerId = tenantStudent.customerId;
    }
    if(tenantStudent.iban){
      this.iban = tenantStudent.iban;
    }

    this.transactionId = generateTransactionIdAccountCharge(tenantStudent);
    this.date = new Date();
    this.amount = accountTenant.currentBalance;

  }

}

export function getApprovedAccountCharge(type: string): boolean {
  return type === 'deposit';
}
export function generateTransactionIdAccountCharge(tenant: TenantStudentInterface): string {
  return tenant.username  + '-' + Date.now();
}
