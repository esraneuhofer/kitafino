import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {ToastrService} from "ngx-toastr";
import {isValidIBANNumber} from "../../functions/generell.functions";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit{

  tenantModel!: TenantStudentInterface;
  submittingRequest = false;
  pageLoaded = false;
  constructor(private tenantService: TenantServiceStudent,
              private toastr: ToastrService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
      this.tenantModel = tenant;
      if(!this.tenantModel.orderSettings){
        this.tenantModel.orderSettings = {
          orderConfirmationEmail: false,
          sendReminderBalance: false,
          amountBalance:0,
          permanentOrder:false
        }
      }
      this.pageLoaded = true;
    })
  }
  editPersonalInformation(){
    if(this.tenantModel.iban && !isValidIBANNumber(this.tenantModel.iban)){
      this.toastr.warning('Bitte geben Sie eine gültige IBAN ein')
      return
    }
    this.pageLoaded = false;
    this.tenantService.editParentTenant(this.tenantModel).subscribe((response)=>{

      this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
        this.tenantModel = tenant;
        this.toastr.success('Einstellungen gespeichert');
        this.pageLoaded = true;
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
