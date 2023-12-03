import { Component } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-banner-no-registration-order',
  templateUrl: './banner-no-registration-order.component.html',
  styleUrls: ['./banner-no-registration-order.component.scss']
})
export class BannerNoRegistrationOrderComponent {

  goToRegistration() {
    this.router.navigate(['../home/register_student'], {relativeTo: this.r.parent});
  }
  constructor(private router: Router,
              private r: ActivatedRoute) {
  }
}
