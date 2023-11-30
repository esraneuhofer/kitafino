export interface StudentInterface {
  _id?: string;
  firstName: string;
    lastName: string;
  username:string;
  subgroup:string,
  customerId:string,

}

export function setEmptyStudentModel():StudentInterface{
  return {
    firstName: '',
    lastName:'',
    username:'',
    customerId:'',
    subgroup:''
  }
}

// export interface StudentInterface {
//   _id?: string;
//   ganztag: string;
//   edited: boolean;
//   customerNumber: string;
//   editedDate: { change: string, changeConfirmed: boolean }[],
//   contractConfirmed: boolean;
//   active: boolean;
//   projectId: string;
//   userId: string;
//   nameStudent: string;
//   nameContractPartner: string;
//   street: string;
//   city_zip: string;
//   phone: string;
//   email: string;
//   orderFix: string;
//   selectedDays: { selected: boolean }[],
//   subscription: string;
//   bildungTeilhabe: BildungTeilhabeInterface,
//   bildungTeilhabeOld:{
//     dateBuTDocumentIssued:string;
//     dateAddBut:string;
//     begin: string;
//     end: string;
//   }[]
//   specialDiet: string;
//   payment: PaymentInterfaceStudent,
//   mandatsreferenz: string;
//   beginContractWish: string;
//   beginContractConfirm: Date;
//   endContractConfirm: Date;
//   dateSignContract: string;
//
// }
//
// export interface BildungTeilhabeInterface {
//   dateBuTDocumentIssued:string;
//   dateAddBut:string;
//   hasBuT: boolean;
//   buTConfirmed: boolean;
//   begin: string;
//   end: string;
//   documents: []
// }
//
// export interface PaymentInterfaceStudent {
//   accountOwner: string;
//   iban: string;
// }
