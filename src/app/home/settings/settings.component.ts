import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit{

  tenantModel!: TenantStudentInterface;
  submittingRequest = false;

  constructor(private tenantService: TenantServiceStudent,
              private toastr: ToastrService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
      this.tenantModel = tenant;
    })
  }
  editPersonalInformation(){
    this.tenantService.editParentTenant(this.tenantModel).subscribe((response)=>{

      this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
        this.tenantModel = tenant;
        this.toastr.success('Einstellungen gespeichert');
      })
    })
  }
  editTenantOrderSettings(boolean:boolean,type:('orderConfirmationEmail' | 'sendReminderBalance')){
    this.tenantModel.orderSettings[type] = boolean;
    this.tenantService.editParentTenant(this.tenantModel).subscribe((response)=>{
      this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
        this.tenantModel = tenant;
        this.toastr.success('Einstellungen gespeichert');
      })
    })
  }
}
