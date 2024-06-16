import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {ToastrService} from "ngx-toastr";
import {isValidIBANNumber} from "../../functions/generell.functions";
import {MessageDialogService} from "../../service/message-dialog.service";
import {TranslateService} from "@ngx-translate/core";

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
              private translate: TranslateService,
              private messageService:MessageDialogService) {
  }
  showFullIban: boolean = true;
  isEditing: boolean = false;

  get maskedIban(): string {
    if(!this.tenantModel || !this.tenantModel.iban)return ''
    if (this.showFullIban) {
      return this.tenantModel.iban;
    } else {
      return this.tenantModel.iban.replace(/.(?=.{4})/g, '*'); // Maskiert alle Zeichen außer den letzten 4
    }
  }

  toggleIbanVisibility(): void {
    this.showFullIban = !this.showFullIban;
  }

  toggleEditIban(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Speichern der IBAN (hier könnten Sie zusätzliche Logik hinzufügen, z.B. Validierung)
    }
  }


  ngOnInit() {
    this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
      this.tenantModel = tenant;
      if(!this.tenantModel.orderSettings){
        this.tenantModel.orderSettings = {
          orderConfirmationEmail: false,
          sendReminderBalance: false,
          amountBalance:0,
          permanentOrder:false,
          displayTypeOrderWeek:false
        }
      }
      if(this.tenantModel.iban){
        this.showFullIban = false;
      }
      this.pageLoaded = true;
    })
  }
  editPersonalInformation(){
    if(this.tenantModel.iban && !isValidIBANNumber(this.tenantModel.iban)){
      let message = this.translate.instant('MANAGE_TENANT_SETTINGS.ERROR_INVALID_IBAN')
      this.messageService.openMessageDialog(message,this.translate.instant('ERROR_TITLE'),'error')
      return
    }
    this.pageLoaded = false;
    this.tenantService.editParentTenant(this.tenantModel).subscribe((response)=>{

      this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
        this.tenantModel = tenant;
        this.toastr.success(this.translate.instant('MANAGE_TENANT_SETTINGS.SUCCESS_SETTINGS_SAVED'));
        this.pageLoaded = true;
      })
    })
  }
  editTenantOrderSettings(boolean:boolean,type:('orderConfirmationEmail' | 'sendReminderBalance' | 'displayTypeOrderWeek' )){
    this.submittingRequest = true;
    this.tenantModel.orderSettings[type] = boolean;
    this.tenantService.editParentTenant(this.tenantModel).subscribe((response)=>{
      this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
        this.tenantModel = tenant;
        this.toastr.success(this.translate.instant('MANAGE_TENANT_SETTINGS.SUCCESS_SETTINGS_SAVED'));
        this.submittingRequest = false;

      })
    })
  }
}
