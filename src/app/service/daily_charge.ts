import {ChargeAccountInterface} from "../classes/charge.class";


function eachPaymentHasNotBeenSavedYet(payment:ChargeAccountInterface,savedPayments:ChargeAccountInterface[]):boolean{
  let exists:boolean = false
  savedPayments.forEach(savedPayment =>{
    if(savedPayment.date === payment.date && savedPayment.amount === payment.amount && savedPayment.accountHolder === payment.accountHolder){
      exists = true
    }
  })
  return exists
}
export function checkDailyCharge(paymentArrayDay:ChargeAccountInterface[],savedPayments:ChargeAccountInterface[]):void{

  paymentArrayDay.forEach(eachDayPayment =>{
    if(!eachPaymentHasNotBeenSavedYet(eachDayPayment,savedPayments)){
      savedPayments.push(eachDayPayment)
    }
  })


  //If exists in Charge Array not charge Double
  //If amount, date and name Account holder is the same not be added Again
}

export function setPaymentArrayFromBank(payment:any):ChargeAccountInterface[]{
  let array:ChargeAccountInterface[] = [];
  return array;
}
