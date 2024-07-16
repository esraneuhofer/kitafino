import { Component } from '@angular/core';
import {PlatformService} from "../../../service/platform.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-not-success-stripe',
  templateUrl: './not-success-stripe.component.html',
  styleUrls: ['./not-success-stripe.component.scss']
})
export class NotSuccessStripeComponent {

  isApp:boolean = false;
  constructor(private platformService: PlatformService,private route: ActivatedRoute) {
    this.isApp = this.platformService.isAndroid || this.platformService.isIos;
  }

  goBack(){
      window.location.href = "https://essen.cateringexpert.de/home/dashboard";

  }
}
