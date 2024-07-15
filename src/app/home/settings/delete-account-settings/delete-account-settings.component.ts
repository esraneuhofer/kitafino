import {Component, OnInit} from '@angular/core';
import {TenantStudentInterface} from "../../../classes/tenant.class";
import {AccountCustomerInterface} from "../../../classes/account.class";
import {PasswordNewInterface} from "../settings.component";
import {TenantServiceStudent} from "../../../service/tenant.service";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../../service/user.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AccountService} from "../../../service/account.serive";
import {TranslateService} from "@ngx-translate/core";
import {MessageDialogService} from "../../../service/message-dialog.service";
import {forkJoin, of} from "rxjs";
import {CloseAccountDialogComponent} from "../../../directives/close-account-dialog/close-account-dialog.component";
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-delete-account-settings',
  templateUrl: './delete-account-settings.component.html',
  styleUrls: ['./delete-account-settings.component.scss']
})
export class DeleteAccountSettingsComponent implements OnInit{

  tenantModel!: TenantStudentInterface;
  submittingRequest = false;
  pageLoaded = false;
  accountTenant!: AccountCustomerInterface;
  submittingRequestDeletion = false;

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
}
