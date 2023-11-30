import {Component, OnInit} from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import {HttpClient} from "@angular/common/http";
import {AccountService} from "../../service/account.serive";
import {ChargingService} from "../../service/charging.service";
import {checkDailyCharge, setPaymentArrayFromBank} from "../../service/daily_charge";
import {forkJoin} from "rxjs";
import {ChargeAccountInterface} from "../../classes/charge.class";

@Component({
  selector: 'app-charge-account',
  templateUrl: './charge-account.component.html',
  styleUrls: ['./charge-account.component.scss']
})
export class ChargeAccountComponent implements OnInit{

  accountChargesDatabase:ChargeAccountInterface[] = [];
  constructor(private chargeAccountService:ChargingService) {}

  ngOnInit(): void {
    forkJoin(
      this.chargeAccountService.getAccountChargesDate(new Date())
    ).subscribe(([paymentsDayDatabase]:[any]) => {
      this.accountChargesDatabase = paymentsDayDatabase;

    })
  }

  uploadPaymentDocument(bankFile:any){
    const paymentArray = setPaymentArrayFromBank(bankFile)
    const getOpenPayments = checkDailyCharge(paymentArray,this.accountChargesDatabase)
  }


}
