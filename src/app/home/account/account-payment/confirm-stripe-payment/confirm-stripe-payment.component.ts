import {Component, Inject, OnInit} from '@angular/core';
import {data} from "autoprefixer";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {calculateFeeArray} from "../../account-payment-overview/account-payment-overview.component";

@Component({
  selector: 'app-confirm-stripe-payment',
  templateUrl: './confirm-stripe-payment.component.html',
  styleUrls: ['./confirm-stripe-payment.component.scss']
})
export class ConfirmStripePaymentComponent implements OnInit {

  paymentFeeArray:{namePayment:string,amountFee:number}[] = [];
  isConsentedModel = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {amount:number},
              private dialogRef: MatDialogRef<ConfirmStripePaymentComponent>) {

  }
  ngOnInit() {
    this.paymentFeeArray = calculateFeeArray(this.data.amount);
  }

  closeDialog() {
    this.dialogRef.close(true);
  }
}
