import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AccountChargeInterface, TransactionService} from "../../../service/transaction.service";
import {StudentService} from "../../../service/student.service";


@Component({
  selector: 'app-account-payment-overview',
  templateUrl: './account-payment-overview.component.html',
  styleUrls: ['./account-payment-overview.component.scss']
})
export class AccountPaymentOverviewComponent implements OnInit{

  submittingRequest = false;
  accountCharge:AccountChargeInterface[] = [];
  constructor(private transactionService:TransactionService,

              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {

      this.transactionService.getTransactionTenant()

        .subscribe((response:AccountChargeInterface[])=>{
        this.accountCharge = response;
        console.log(response);
      })
  }

}
