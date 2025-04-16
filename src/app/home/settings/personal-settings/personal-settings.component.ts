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
import {isValidIBANNumber} from "../../../functions/generell.functions";
import {forkJoin} from "rxjs";
import {AccountCustomerInterface} from "../../../classes/account.class";

@Component({
  selector: 'app-personal-settings',
  templateUrl: './personal-settings.component.html',
  styleUrls: ['./personal-settings.component.scss']
})
export class PersonalSettingsComponent implements OnInit{

  tenantModel!: TenantStudentInterface;
  accountTenant!: AccountCustomerInterface;
  submittingRequest = false;

  pageLoaded = false;

  showFullIban: boolean = true;

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
        if (this.tenantModel.iban) {
          this.showFullIban = false;
        }
        this.pageLoaded = true;
      })
  }


  editPersonalInformation() {
    if(!this.tenantModel.iban) {
      // this.toastr.error('Bitte geben Sie eine IBAN ein');
      this.tenantModel.iban = '';
    }
    this.tenantModel.iban = this.tenantModel.iban.replace(/\s+/g, '');
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

  get maskedIban(): string {
    if (!this.tenantModel || !this.tenantModel.iban) return ''
    if (this.showFullIban) {
      return this.tenantModel.iban;
    } else {
      return this.tenantModel.iban.replace(/.(?=.{4})/g, '*'); // Maskiert alle Zeichen außer den letzten 4
    }
  }

  toggleIbanVisibility(): void {
    this.showFullIban = !this.showFullIban;
  }

}
