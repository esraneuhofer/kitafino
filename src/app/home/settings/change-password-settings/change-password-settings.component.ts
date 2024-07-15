import { Component } from '@angular/core';
import {TenantStudentInterface} from "../../../classes/tenant.class";
import {AccountCustomerInterface} from "../../../classes/account.class";
import {TenantServiceStudent} from "../../../service/tenant.service";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../../service/user.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AccountService} from "../../../service/account.serive";
import {TranslateService} from "@ngx-translate/core";
import {MessageDialogService} from "../../../service/message-dialog.service";
import {forkJoin} from "rxjs";
import {PasswordNewInterface} from "../settings.component";

@Component({
  selector: 'app-change-password-settings',
  templateUrl: './change-password-settings.component.html',
  styleUrls: ['./change-password-settings.component.scss']
})
export class ChangePasswordSettingsComponent {
  tenantModel!: TenantStudentInterface;
  submittingRequest = false;
  pageLoaded = false;
  accountTenant!: AccountCustomerInterface;
  showPasswords = false;
  newPassword:PasswordNewInterface = {
    oldPassword: '',
    newPassword: '',
    repeatNewPassword: '',
  }
  passwordErrors = {
    tooShort: false,
    noCapitalLetter: false,
    noNumber: false,
    noSpecialChar: false,
    mismatch: false
  };
  validatePassword() {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])\w{8,}$/;
    this.passwordErrors.tooShort = this.newPassword.newPassword.length < 8;
    this.passwordErrors.noCapitalLetter = !/[A-Z]/.test(this.newPassword.newPassword);
    this.passwordErrors.noNumber = !/\d/.test(this.newPassword.newPassword);
    this.passwordErrors.noSpecialChar = !/[!@#$%^&*()_+]/.test(this.newPassword.newPassword);
  }
  hasErrors(): boolean {
    return Object.values(this.passwordErrors).some(error => error === true);
  }
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

  changePassword() {
    this.submittingRequest = true;

    if (this.newPassword.newPassword !== this.newPassword.repeatNewPassword) {
      this.messageService.openMessageDialog(
        this.translate.instant('PASSWORD_MISMATCH'),
        this.translate.instant('ERROR_TITLE'),
        'error'
      );
      this.submittingRequest = false;
      return;
    }

    this.userService.changePassword(this.newPassword).subscribe(
      (response: any) => {
        console.log('Response from changePassword:', response);
        this.submittingRequest = false;

        if (response.error) {
          this.messageService.openMessageDialog(
            this.translate.instant(response.message),
            this.translate.instant('ERROR_TITLE'),
            'error'
          );
        } else {
          this.messageService.openMessageDialog(
            this.translate.instant('PASSWORD_CHANGE_SUCCESS'),
            this.translate.instant('SUCCESS_TITLE'),
            'success'
          );
        }
      },
      (error: any) => {
        console.error('Error from changePassword:', error);
        this.submittingRequest = false;
        this.messageService.openMessageDialog(
          this.translate.instant(error.error.message),
          this.translate.instant('ERROR_TITLE'),
          'error'
        );
      }
    );
  }

}
