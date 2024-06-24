import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {ToastrService} from "ngx-toastr";
import {isValidIBANNumber} from "../../functions/generell.functions";
import {MessageDialogService} from "../../service/message-dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {DialogErrorComponent} from "../../directives/dialog-error/dialog-error.component";
import {ExportCsvDialogData} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import {CloseAccountDialogComponent} from "../../directives/close-account-dialog/close-account-dialog.component";
import {UserService} from "../../service/user.service";
import {catchError} from "rxjs/operators";
import {forkJoin, of} from "rxjs";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {CustomerInterface} from "../../classes/customer.class";
import {StudentInterfaceId} from "../../classes/student.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {PermanentOrderInterface} from "../../classes/permanent-order.interface";
import {AccountService} from "../../service/account.serive";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit{

  tenantModel!: TenantStudentInterface;
  submittingRequest = false;
  pageLoaded = false;
  submittingRequestDeletion = false;
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

  showFullIban: boolean = true;
  isEditing: boolean = false;

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

  toggleEditIban(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Speichern der IBAN (hier könnten Sie zusätzliche Logik hinzufügen, z.B. Validierung)
    }
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

  editPersonalInformationSetting(){
    if(this.tenantModel.orderSettings.sendReminderBalance && this.tenantModel.orderSettings.amountBalance < 10){
      this.messageService.openMessageDialog(
        this.translate.instant('ERROR_EINSTELLUNG_MINDESTBETRAG_GUTHABENw'),'Mindestbestrag','warning'
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

  editTenantOrderSettings(boolean: boolean, type: ('orderConfirmationEmail' | 'sendReminderBalance' | 'displayTypeOrderWeek')) {
    this.submittingRequest = true;
    this.tenantModel.orderSettings[type] = boolean;
    this.tenantService.editParentTenant(this.tenantModel).subscribe((response) => {
      this.tenantService.getTenantInformation().subscribe((tenant: TenantStudentInterface) => {
        this.tenantModel = tenant;
        this.toastr.success(this.translate.instant('MANAGE_TENANT_SETTINGS.SUCCESS_SETTINGS_SAVED'));
        this.submittingRequest = false;

      })
    })
  }

  closeAccount() {
    if(this.accountTenant.currentBalance > 0){
      this.messageService.openMessageDialog(
        this.translate.instant('GELD_AUSZAHLEN_KONTO_SCHLIESSEN'),
        this.translate.instant('ERROR_TITLE'),
        'error'
      )
      return
    }
    this.submittingRequest = true;

    const dialogRef = this.dialog.open(CloseAccountDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      position: {top: '100px'},
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      console.log('The dialog was closed', result);
      if (!result) {
        this.submittingRequest = false;
      } else {
        this.submittingRequest = true;
        this.userService.deactivateAccount().pipe(
          catchError(err => {
            console.error('Error deactivating account:', err);
            // Display an error message to the user
            // Handle the error and stop further processing
            this.submittingRequest = false;
            return of(null); // Return a safe fallback value or an empty observable
          })
        ).subscribe((response) => {
          if (response && !response.error) {
            this.userService.deleteToken();
            this.router.navigate(['/login']);
          } else {
            // Handle failure response
          }
          this.submittingRequest = false;
        });
      }
    })
  }

  reminderBalanceSet(boolean:boolean):void{
    if(!boolean){
      this.tenantModel.orderSettings.amountBalance = 0;
    }
  }
}
