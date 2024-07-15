import {Component, OnInit} from '@angular/core';
import {TenantStudentInterface} from "../../../classes/tenant.class";
import {TenantServiceStudent} from "../../../service/tenant.service";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../../service/user.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AccountService} from "../../../service/account.serive";
import {TranslateService} from "@ngx-translate/core";
import {MessageDialogService} from "../../../service/message-dialog.service";
import {forkJoin} from "rxjs";
import {AccountCustomerInterface} from "../../../classes/account.class";
import {isValidIBANNumber} from "../../../functions/generell.functions";

@Component({
  selector: 'app-order-settings',
  templateUrl: './order-settings.component.html',
  styleUrls: ['./order-settings.component.scss']
})
export class OrderSettingsComponent implements OnInit{

  tenantModel!: TenantStudentInterface;
  submittingRequest = false;
  pageLoaded = false;
  accountTenant!: AccountCustomerInterface;

  constructor(private tenantService: TenantServiceStudent,
              private toastr: ToastrService,
              private userService: UserService,
              private dialog: MatDialog,
              private router: Router,
              private accountService: AccountService,
              private translate: TranslateService,
              private messageService: MessageDialogService) {
  }
  ngOnInit() {
    forkJoin([
      this.tenantService.getTenantInformation(),
      this.accountService.getAccountTenant(),
    ]).subscribe(
      ([
         tenantStudent,
         accountTenant,
       ]: [
        TenantStudentInterface,
        AccountCustomerInterface,
      ]) => {
        this.tenantModel = tenantStudent;
        this.accountTenant = accountTenant;
        if (!this.tenantModel.orderSettings) {
          this.tenantModel.orderSettings = {
            orderConfirmationEmail: false,
            sendReminderBalance: false,
            amountBalance: 0,
            permanentOrder: false,
            displayTypeOrderWeek: false
          }
        }

        this.pageLoaded = true;
      })
  }
  editPersonalInformationSetting(){
    if(this.tenantModel.orderSettings.sendReminderBalance && this.tenantModel.orderSettings.amountBalance < 10){
      this.messageService.openMessageDialog(
        this.translate.instant('ERROR_EINSTELLUNG_MINDESTBETRAG_GUTHABEN'),this.translate.instant('MINDESTBETRAG'),'warning'
      )
    }else{
      this.editPersonalInformation();
    }
  }
  editPersonalInformation() {
    if (this.tenantModel.iban && !isValidIBANNumber(this.tenantModel.iban)) {
      let message = this.translate.instant('MANAGE_TENANT_SETTINGS.ERROR_INVALID_IBAN')
      this.messageService.openMessageDialog(message, this.translate.instant('ERROR_TITLE'), 'error')
      return
    }
    this.pageLoaded = false;
    this.tenantService.editParentTenant(this.tenantModel).subscribe((response) => {

      this.tenantService.getTenantInformation().subscribe((tenant: TenantStudentInterface) => {
        this.tenantModel = tenant;
        this.toastr.success(this.translate.instant('MANAGE_TENANT_SETTINGS.SUCCESS_SETTINGS_SAVED'));
        this.pageLoaded = true;
      })
    })
  }

  reminderBalanceSet(boolean:boolean):void{
    if(!boolean){
      this.tenantModel.orderSettings.amountBalance = 0;
    }
  }

}
