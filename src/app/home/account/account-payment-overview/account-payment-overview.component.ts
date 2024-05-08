import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StudentService} from "../../../service/student.service";
import {forkJoin} from "rxjs";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {CustomerInterface} from "../../../classes/customer.class";
import {StudentInterface} from "../../../classes/student.class";
import {TenantStudentInterface} from "../../../classes/tenant.class";
import {GenerellService} from "../../../service/generell.service";
import {ToastrService} from "ngx-toastr";
import {TenantServiceStudent} from "../../../service/tenant.service";
import {faClipboard, faShoppingCart} from "@fortawesome/free-solid-svg-icons";
import {ClipboardService} from "../../../service/clipboard.service";
import {AccountChargeInterface, ChargeAccountInterface} from "../../../classes/charge.class";
import {ChargingService} from "../../../service/charging.service";
import {AccountService} from "../../../service/account.serive";
import {AccountCustomerInterface} from "../../../classes/account.class";
import {MatDialog} from "@angular/material/dialog";
import {
  ConfirmWithdrawDialogComponent
} from "../account-payment/confirm-withdraw-dialog/confirm-withdraw-dialog.component";
import {loadStripe} from '@stripe/stripe-js';
import {HttpClient} from "@angular/common/http";
import {PaymentService} from "../../../service/payment-stripe.service";

const textBanner = 'Um Geld auf Ihr Konto aufzuladen, müssen Sie zuerst einen Schüler/in hinzufügen. Klicken Sie hier, um eine Schüler/in hinzuzufügen.';

export interface PaymentIntentResponse {
  clientSecret: string;
}

@Component({
  selector: 'app-account-payment-overview',
  templateUrl: './account-payment-overview.component.html',
  styleUrls: ['./account-payment-overview.component.scss']
})
export class AccountPaymentOverviewComponent implements OnInit {
  protected readonly textBanner = textBanner;
  page: number = 1;
  pageSize: number = 10;
  amountCharge: number = 25;

  pageLoaded: boolean = false;
  submittingRequest = false;
  accountCharges: AccountChargeInterface[] = [];
  registeredStudents: StudentInterface[] = [];
  tenantStudent!: TenantStudentInterface;
  accountTenant!: AccountCustomerInterface;

  constructor(
    private http: HttpClient,
    private clipboardService: ClipboardService,
    private dialog: MatDialog,
    private generellService: GenerellService,
    private toastr: ToastrService,
    private tenantService: TenantServiceStudent,
    private studentService: StudentService,
    private chargeService: ChargingService,
    private accountService: AccountService,
    private paymentService: PaymentService,
    private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    forkJoin([
      this.generellService.getSettingsCaterer(),
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser(),
      this.tenantService.getTenantInformation(),
      this.chargeService.getAccountCharges(),
      this.accountService.getAccountTenant(),
    ]).subscribe(
      ([
         settings,
         customer,
         students,
         tenantStudent,
         accountCharges,
         accountTenant
       ]: [
        SettingInterfaceNew,
        CustomerInterface,
        StudentInterface[],
        TenantStudentInterface,
        AccountChargeInterface[],
        AccountCustomerInterface
      ]) => {
        console.log('accountCharges', accountCharges)
        this.accountCharges = accountCharges;
        this.pageLoaded = true;
        this.tenantStudent = tenantStudent
        this.registeredStudents = students;
        this.accountTenant = accountTenant;
      })
  }

  opendialog() {
    // this.handlePayment();
  }

  openDialog() {
    if (!this.tenantStudent.iban) {
      this.toastr.warning('Bitte tragen Sie Ihre IBAN ein, um Geld abzuheben. Sie können Ihre IBAN in den Einstellungen eintragen.')
      return;
    }
    if (this.accountTenant.currentBalance === 0) {
      this.toastr.warning('Sie haben derzeit kein Guthaben auf Ihrem Konto.')
      return;
    }
    const dialogRef = this.dialog.open(ConfirmWithdrawDialogComponent, {
      width: '550px',
      data: {accountTenant: this.accountTenant, tenantStudent: this.tenantStudent},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const accountCharge = new ChargeAccountInterface(
        this.accountTenant,
        this.tenantStudent,
        'withdraw'
      );
      accountCharge.emailTenant = this.tenantStudent.email;
      console.log('accountCharge', accountCharge)
      this.chargeService.addAccountChargesTenant(accountCharge).subscribe((response: any) => {
        this.toastr.success('Abbuchung erfolgreich')
      })

    });
  }

  copyToClipboard(text: string) {
    this.clipboardService.copyToClipboard(text)
    this.toastr.success('Text kopiert');
  }

  getType(type: string) {
    if (type === 'charge') {
      return 'Aufladung'
    }

    return 'Abbuchung'
  }

  redirectToStripeCheckout(amount:number) {
    this.submittingRequest = true;
    this.paymentService.redirectToStripeCheckout(amount,this.tenantStudent.username);
  }
  faClipboard = faClipboard;

}
