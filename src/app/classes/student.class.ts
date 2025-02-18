export interface StudentInterface {
  _id?: string;
  firstName: string;
    lastName: string;
  username:string;
  subgroup:string,
  customerId:string,
  specialFood: string | null;
  tenantId?: string;
  userId?: string;
  registerDate: Date;
  butFrom: string | null;
  butTo: string | null;
  butDaysPerWeek: number;
}
export interface StudentInterfaceId extends StudentInterface{
  _id: string;
}
export function setEmptyStudentModel():StudentInterface{
  return {
    registerDate: new Date(),
    firstName: '',
    lastName:'',
    username:'',
    customerId:'',
    subgroup:'',
    specialFood: null,
    butFrom:null,
    butTo: null,
    butDaysPerWeek: 0
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
