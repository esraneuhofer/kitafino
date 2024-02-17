import {Component, Input} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-banner-no-student-order',
  templateUrl: './banner-no-student-order.component.html',
  styleUrls: ['./banner-no-student-order.component.scss']
})
export class BannerNoStudentOrderComponent {

  @Input() text: string = 'Um eine Aktion durchzuführen, müssen Sie zuerst einen Schüler/in hinzufügen. Klicken Sie hier, um eine Schüler/in hinzuzufügen.'
  constructor(private router:Router, private r: ActivatedRoute) { }
  routeToAccount(){
    this.router.navigate(['../home/register_student'], {relativeTo: this.r.parent});
  }
}
