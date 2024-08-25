export interface StudentInterface {
  _id?: string;
  firstName: string;
    lastName: string;
  username:string;
  subgroup:string,
  customerId:string,
  specialFood: string | null;
  bildungTeilhabe: boolean;
  tenantId?: string;
  userId?: string;
  registrationDate: Date;
  // butFrom: string;
  // butTo: string;
  // butAmount: number;
  bildungTeilhabeLog:{butFrom:string, butTo:string, butAmount:number}[]
}
export interface StudentInterfaceId extends StudentInterface{
  _id: string;
}
export function setEmptyStudentModel():StudentInterface{
  return {
    bildungTeilhabe: false,
    // butFrom: '',
    // butTo: '',
    registrationDate: new Date(),
    bildungTeilhabeLog:[],
    firstName: '',
    lastName:'',
    username:'',
    customerId:'',
    subgroup:'',
    specialFood: null,

  }
}
export interface StudentInterfaceSeed {
  _id?: string;
  firstName: string;
  lastName: string;
  username:string;
  subgroup:string,
  customerId:string,
  specialFood: string | null;
  tenantId: string;
  userId: string;
}
