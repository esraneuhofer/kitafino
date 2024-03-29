import { Component } from '@angular/core';
import {TenantStudentInterface} from "../../classes/tenant.class";
import {TenantServiceStudent} from "../../service/tenant.service";
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

    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    orderSettings:{
      orderConfirmationEmail:false,
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
      this.tenantModel.email = response.user.email || '';
      // this.tenantModel.email = response || '';
    })
  }

  setPersonalInformation() {
    this.submittingRequest = true;
    this.tenantServiceStudent.addParentTenant(this.tenantModel).subscribe((response: any) => {
      console.log(response)
      if (!response.error) {
        this.submittingRequest = false
        this.toastr.success('Sie haben Ihre persönlichen Daten erfolgreich eingetragen', 'Erfolg')
        this.router.navigateByUrl('/home/register_student');
      }else{

        this.submittingRequest = false
      }
    })
  }

}
