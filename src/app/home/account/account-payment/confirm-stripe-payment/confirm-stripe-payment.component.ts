import {Component, Inject, OnInit} from '@angular/core';
import {data} from "autoprefixer";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {calculateFeeArray} from "../../account-payment-overview/account-payment-overview.component";

@Component({
  selector: 'app-confirm-stripe-payment',
  templateUrl: './confirm-stripe-payment.component.html',
  styleUrls: ['./confirm-stripe-payment.component.scss']
})
export class ConfirmStripePaymentComponent implements OnInit {

  paymentFeeArray:{namePayment:string,amountFee:number}[] = [];


  constructor(@Inject(MAT_DIALOG_DATA) public data: {amount:number} ) {

  }
  ngOnInit() {
    console.log(this.data);
    this.paymentFeeArray = calculateFeeArray(this.data.amount);
    console.log(this.paymentFeeArray);
  }
}
