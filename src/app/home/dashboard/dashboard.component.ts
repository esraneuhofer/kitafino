import { Component } from '@angular/core';
import {TenantStudentInterface} from "../../classes/tenant.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {StudentInterface} from "../../classes/student.class";
import {DateOrderSingleInterface, orderCustomerSeed} from "../../seed.data";
import {TenantServiceStudent} from "../../service/tenant.service";
import {AccountService} from "../../service/account.serive";
import {StudentService} from "../../service/student.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {LoadingService} from "../../service/loading.service";
import {UserService} from "../../service/user.service";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  tenant!:TenantStudentInterface;
  pageLoaded:boolean = false;
  accountTenant!:AccountCustomerInterface;
  students:StudentInterface[] = [];
  ordersCustomer:DateOrderSingleInterface[] = orderCustomerSeed
  constructor(private tenantServiceStudent: TenantServiceStudent,
              private accountService:AccountService,
              private studentService:StudentService,
              private r: ActivatedRoute,
              private router:Router,
              private toastr: ToastrService,
              private loadingService: LoadingService,
              private userService: UserService) {
  }
  ngOnInit() {
    this.pageLoaded = false
    forkJoin(
      this.tenantServiceStudent.getTenantInformation(),
      this.accountService.getAccountTenant(),
      this.studentService.getRegisteredStudentsUser()
    )
      .subscribe(([tenantInformation,accountInformation,students]:[TenantStudentInterface,AccountCustomerInterface,StudentInterface[]]) =>{
        this.tenant = tenantInformation;
        this.accountTenant = accountInformation;
        this.students = students;
        this.loadingService.hide();
        this.pageLoaded = true;
      })
  }
  downLoadeHistory(){
  }
  routeToAccount(){
    this.router.navigate(['../home/charge_account'], {relativeTo: this.r.parent});
  }
}
