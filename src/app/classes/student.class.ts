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
  // butFrom: string;
  // butTo: string;
  // butAmount: number;
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
