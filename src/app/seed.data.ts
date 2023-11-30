export const  orderCustomerSeed:DateOrderSingleInterface[] = [
  {dateOrderSingle:'2021-01-01', amount: 1, price: 3.8, changePossible:false,studentId:1,nameMenu:'Nudeln Bolognese'},
  {dateOrderSingle:'2021-02-01', amount: 1, price: 3.8, changePossible:false,studentId:1,nameMenu:'Hühnerfrikassee mit Reis'},
  {dateOrderSingle:'2021-03-01', amount: 1, price: 3.8, changePossible:false,studentId:1,nameMenu:'Lasagne'},
  {dateOrderSingle:'2021-04-01', amount: 1, price: 3.8, changePossible:true,studentId:1,nameMenu:'Nudeln mit Tomatensoße'},
  {dateOrderSingle:'2021-07-01', amount: 1, price: 3.8, changePossible:true,studentId:1,nameMenu:'Gulasch mit Kartoffeln'},
]

export interface DateOrderSingleInterface {
  dateOrderSingle:string;
  amount:number;
  price:number;
  changePossible:boolean;
  studentId:number;
  nameMenu:string;
}
