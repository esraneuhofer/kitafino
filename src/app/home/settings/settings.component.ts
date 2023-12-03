import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../service/user.service";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {forkJoin} from "rxjs";
import {AccountService} from "../../service/account.serive";
import {AccountCustomerInterface} from "../../classes/account.class";
import {StudentInterface} from "../../classes/student.class";
import {StudentService} from "../../service/student.service";
import {LoadingService} from "../../service/loading.service";
import {DateOrderSingleInterface, orderCustomerSeed} from "../../seed.data";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit{

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

  }
}
