import { Component } from '@angular/core';
import {TenantStudentInterface} from "../../classes/tenant.class";
import {TenantServiceStudent} from "../../service/tenant_student.class";
import {Router} from "@angular/router";
import {UserService} from "../../service/user.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-register-tenant',
  templateUrl: './register-tenant.component.html',
  styleUrls: ['./register-tenant.component.scss']
})
export class RegisterTenantComponent {

  successFullSave:boolean = false;
  submittingRequest:boolean = false;

  tenantModel: TenantStudentInterface = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    orderSettings:{
      sendReminderBalance:false,
      amountBalance:0,
      permanentOrder:false,
    }
  }

  constructor(private tenantServiceStudent: TenantServiceStudent,
              private router:Router,
              private toastr: ToastrService,
              private userService: UserService) {
    userService.userProfile().subscribe((response: any) => {
      console.log(response)
      this.tenantModel.email = response.user.email || '';
      // this.tenantModel.email = response || '';
    })
  }

  setPersonalInformation() {
    this.submittingRequest = true;
    this.tenantServiceStudent.addParentTenant(this.tenantModel).subscribe((response: any) => {
      if (!response.error) {
        this.submittingRequest = false
        this.toastr.success('Sie haben Ihre persönlichen Daten erfolgreich eingetragen', 'Erfolg')
        this.router.navigateByUrl('/home/dashboard');
      }else{

        this.submittingRequest = false
      }
    })
  }

}
