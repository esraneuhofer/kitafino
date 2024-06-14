import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-charge-account',
  templateUrl: './charge-account.component.html',
  styleUrls: ['./charge-account.component.scss']
})
export class ChargeAccountComponent implements OnInit{

  // accountChargesDatabase:ChargeAccountInterface[] = [];
  constructor(
    // private chargeAccountService:ChargingService
  ) {}

  ngOnInit(): void {
    // forkJoin(
    //   this.chargeAccountService.getAccountCharges()
    // ).subscribe(([paymentsDayDatabase]:[any]) => {
    //   this.accountChargesDatabase = paymentsDayDatabase;
    //
    // })
  }

  // uploadPaymentDocument(bankFile:any){
  //   const paymentArray = setPaymentArrayFromBank(bankFile)
  //   const getOpenPayments = checkDailyCharge(paymentArray,this.accountChargesDatabase)
  // }


}
