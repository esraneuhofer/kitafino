export interface StudentInterface {
  _id?: string;
  firstName: string;
    lastName: string;
  username:string;
  subgroup:string,
  customerId:string,
  specialFood: string | null;
}
export interface StudentInterfaceId extends StudentInterface{
  _id: string;
}
export function setEmptyStudentModel():StudentInterface{
  return {
    firstName: '',
    lastName:'',
    username:'',
    customerId:'',
    subgroup:'',
    specialFood: null
  }
}

