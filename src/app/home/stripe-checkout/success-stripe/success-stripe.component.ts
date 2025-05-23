import {Component, OnInit} from '@angular/core';
import {PlatformService} from "../../../service/platform.service";
import {environment} from "../../../../environments/environment";
import {ActivatedRoute} from "@angular/router";
@Component({
  selector: 'app-success-stripe',
  templateUrl: './success-stripe.component.html',
  styleUrls: ['./success-stripe.component.scss']
})
export class SuccessStripeComponent implements OnInit {

  amountCharged: number = 0;
  isApp: boolean = false;
  constructor(private platformService: PlatformService,private route: ActivatedRoute) { }

  ngOnInit() {
    this.isApp = this.platformService.isAndroid || this.platformService.isIos;
    this.route.queryParams.subscribe(params => {
      this.amountCharged = +params['amount'];  // Das "+" konvertiert den Parameter in eine Zahl
    });
    // document.addEventListener("DOMContentLoaded", () => {
    //   if (this.platformService.isAndroid) {
    //     window.location.href = "your-android-app://home/account_overview?status=success";
    //   } else if (this.platformService.isIos) {
    //     window.location.href = "your-ios-app://home/dashboard?status=success";
    //   } else {
    //     window.location.href = environment.successUrl;
    //     window.location.href = "http://localhost:4200/home/account_overview?status=success";
    //   }
    // });
  }
  goBack(){

    window.location.href = "https://essen.cateringexpert.de/home/dashboard";

    // if (this.platformService.isAndroid) {
    //   window.location.href = "your-android-app://home/dashboard";
    // } else if (this.platformService.isIos) {
    //   window.location.href = "your-ios-app://home/dashboard";
    // } else {
    //   window.location.href = environment.successUrl;
    //   window.location.href = "http://localhost:4200/home/account_overview?status=success";
    // }
  }
}
