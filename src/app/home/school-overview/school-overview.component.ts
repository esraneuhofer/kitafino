import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {AccountService} from "../../service/account.serive";
import {StudentService} from "../../service/student.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {LoadingService} from "../../service/loading.service";
import {OrderService} from "../../service/order.service";
import {GenerellService} from "../../service/generell.service";
import {forkJoin} from "rxjs";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {StudentInterface} from "../../classes/student.class";
import {OrderInterfaceStudentSave} from "../../classes/order_student_safe.class";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {CustomerInterface} from "../../classes/customer.class";

@Component({
  selector: 'app-school-overview',
  templateUrl: './school-overview.component.html',
  styleUrls: ['./school-overview.component.scss']
})
export class SchoolOverviewComponent implements OnInit{

  pageLoaded:boolean = false;
  customer?:CustomerInterface
  tenant?:TenantStudentInterface;
  setting?:SettingInterfaceNew;
  constructor(private tenantServiceStudent: TenantServiceStudent,
              private accountService:AccountService,
              private studentService:StudentService,
              private r: ActivatedRoute,
              private router:Router,
              private toastr: ToastrService,
              private loadingService: LoadingService,
              private orderService: OrderService,
              private generallService:GenerellService) {
  }
  ngOnInit() {
    forkJoin(
      this.tenantServiceStudent.getTenantInformation(),
      this.generallService.getSettingsCaterer(),
    this.generallService.getCustomerInfo()
    ).subscribe((
        [tenantInformation,setting,customer]:
          [TenantStudentInterface,SettingInterfaceNew,CustomerInterface]) =>{
        this.tenant = tenantInformation;
        this.setting = setting;
        this.customer = customer;
        this.pageLoaded = true;
      })
  }
}
