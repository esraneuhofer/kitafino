import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant_student.class";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../service/user.service";
import {TenantStudentInterface} from "../../classes/tenant.class";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit{

  tenant!:TenantStudentInterface;
  constructor(private tenantServiceStudent: TenantServiceStudent,
              private router:Router,
              private toastr: ToastrService,
              private userService: UserService) {
  }
  ngOnInit() {
    this.tenantServiceStudent.getTenantInformation().subscribe((tenantInformation:TenantStudentInterface) =>{
      this.tenant = tenantInformation;
    })
  }

}
