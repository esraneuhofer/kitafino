import { Component } from '@angular/core';
import {TenantStudentInterface} from "../../classes/tenant.class";
import {TenantServiceStudent} from "../../service/tenant_student.class";
import {Router} from "@angular/router";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-register-tenant',
  templateUrl: './register-tenant.component.html',
  styleUrls: ['./register-tenant.component.scss']
})
export class RegisterTenantComponent {

  tenantModel: TenantStudentInterface = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  }

  constructor(private tenantServiceStudent: TenantServiceStudent,
              private router:Router,
              private userService: UserService) {
    userService.userProfile().subscribe((response: any) => {
      this.tenantModel.email = 'esra.neuhofer@yahoo.de';
      // this.tenantModel.email = response || '';
    })
  }

  setPersonalInformation() {
    this.tenantServiceStudent.addTenantStudent(this.tenantModel).subscribe((response: any) => {
      if (response.success) {
        this.router.navigateByUrl('/dashboard');
      }
    })
  }

}
