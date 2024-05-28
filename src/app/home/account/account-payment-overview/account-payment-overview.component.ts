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
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {DialogErrorComponent} from "../../../directives/dialog-error/dialog-error.component";
import {MessageDialogService} from "../../../service/message-dialog.service";

const textBanner = 'Um Geld auf Ihr Konto aufzuladen, müssen Sie zuerst einen Schüler/in hinzufügen. Klicken Sie hier, um eine Schüler/in hinzuzufügen.';

export interface PaymentIntentResponse {
  clientSecret: string;
}
function sortAccountChargesByDate(accountCharges: AccountChargeInterface[]): AccountChargeInterface[] {
  return accountCharges.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
@Component({
  selector: 'app-account-payment-overview',
  templateUrl: './account-payment-overview.component.html',
  styleUrls: ['./account-payment-overview.component.scss']
})
export class AccountPaymentOverviewComponent implements OnInit {
  protected readonly textBanner = textBanner;
  page: number = 1;
  pageSize: number = 5;
  amountCharge:number | null = null;
  paymentFeeArray:{namePayment:string,amountFee:number}[] = [];
  pageLoaded: boolean = false;
  submittingRequest = false;
  accountCharges: AccountChargeInterface[] = [];
  registeredStudents: StudentInterface[] = [];
  tenantStudent!: TenantStudentInterface;
  accountTenant!: AccountCustomerInterface;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
    private dialogService: MessageDialogService,
    private cd: ChangeDetectorRef) {
  }
  private updateUrlWithoutStatus() {
    const navigationExtras: NavigationExtras = {
      queryParams: {}
    };
    this.router.navigate([], navigationExtras);
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      if (status === 'success') {
        this.dialogService.openMessageDialog('Ihre Einzahlung war erfolgreich! <b> Der Einzahlungsbetrag wurde Ihrem Konto gutgeschrieben', 'Einzahlung Erfolgreich');
        this.updateUrlWithoutStatus();
      } else if (status === 'failure') {
        this.dialogService.openMessageDialog('Ihre Einzahlung ist fehlgeschlagen <br> Bitte überprüfen Sie Ihre Eingabe. <br><br> Sollten der Fehler bestehen bleiben, wenden Sie sich bitte an support@cateringexpert.de', 'Fehler');
        this.updateUrlWithoutStatus();
      }
    })
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

        this.accountCharges = sortAccountChargesByDate(accountCharges);
        this.tenantStudent = tenantStudent
        this.registeredStudents = students;
        this.accountTenant = accountTenant;

        this.pageLoaded = true;
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
    this.submittingRequest = true;
    const dialogRef = this.dialog.open(ConfirmWithdrawDialogComponent, {
      width: '550px',
      data: {accountTenant: this.accountTenant, tenantStudent: this.tenantStudent},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result){
        this.submittingRequest = false;
        return;
      }
      const accountCharge = new ChargeAccountInterface(
        this.accountTenant,
        this.tenantStudent,
        'withdraw'
      );
      console.log(accountCharge);
      accountCharge.emailTenant = this.tenantStudent.email;
      this.chargeService.addAccountChargesTenant(accountCharge).subscribe((response: any) => {
        console.log(response);
        forkJoin([
          this.chargeService.getAccountCharges(),
          this.accountService.getAccountTenant()
        ]).subscribe(([accountCharges, accountTenant]: [AccountChargeInterface[], AccountCustomerInterface]) => {
          this.accountTenant = accountTenant;
          this.accountCharges = sortAccountChargesByDate(accountCharges);
          const message = `Ihre Abbuchung ist bei uns eingegangen und wird bearbeitet.<br>Es kann bis zu 5 Werktagen dauern bis das Geld auf Ihr Konto überwiesen wurde.<br>Unter "Details Kontobewegung" können Sie den aktuellen Status einsehen.`;
          this.dialogService.openMessageDialog(message, 'Abbuchung erfolgreich');
          this.toastr.success('Abbuchung erfolgreich')
          this.submittingRequest = false;
        })
      })

    });
  }

  copyToClipboard(text: string) {
    this.clipboardService.copyToClipboard(text)
    this.toastr.success('Text kopiert');
  }



  redirectToStripeCheckout(amount:number | null) {
    if(!amount)return
    if(!this.tenantStudent.userId)return
    this.submittingRequest = true;
    this.paymentService.redirectToStripeCheckout(amount,this.tenantStudent.userId,this.tenantStudent.username);
  }
  faClipboard = faClipboard;
  estimatedFee: number = 0;
   calculateFee( amount:number,paymentMethod:string) {
    let feePercentage = 0;
    let fixedFee = 0;

    switch (paymentMethod) {
      case 'Link':
        feePercentage = 1.2 / 100;  // PayPal fees plus an additional 0.2%
        fixedFee = 0.25;  // Plus PayPal's own fees
        break;
      case 'Paypal':
        feePercentage = 0.2 / 100;  // PayPal fees plus an additional 0.2%
        fixedFee = 0.10;  // Plus PayPal's own fees
        break;
      case 'Giropay':
        feePercentage = 1.4 / 100;
        fixedFee = 0.25;
        break;
      case 'Kreditkarte':
      case 'GooglePay':
      case 'ApplePay':
        feePercentage = 1.5 / 100;
        fixedFee = 0.25;
        break;
      case 'Amex':
      case 'Diners':
      case 'Discover':
      default:
        feePercentage = 1.5 / 100;
        fixedFee = 0.25;
        break;
    }

    const feeAmount = amount * feePercentage + fixedFee;
    return Math.ceil(feeAmount * 100) / 100;  // Auf zwei Dezimalstellen runden
  }

  arrayPaymentMethods = ['Giropay', 'Paypal', 'Kreditkarte','Amex','Link'];
  calculateFeeArray(amount: number):{namePayment:string,amountFee:number}[] {
    let arr:{namePayment:string,amountFee:number}[] = [];
    this.arrayPaymentMethods.forEach((paymentMethod) => {
      arr.push({namePayment:paymentMethod,amountFee:this.calculateFee(amount, paymentMethod)})
    })
    return arr;
  }
  onAmountChange(event: any) {
    this.amountCharge = event.target.value;
    if(!this.amountCharge)return
    this.estimatedFee = this.calculateFee(this.amountCharge, 'card');  // Default to 'card', you can change this as needed
    this.paymentFeeArray = this.calculateFeeArray(this.amountCharge);
  }
  goToLink(){
    this.router.navigate(['../home/details_account'], {relativeTo: this.route.parent});
  }

}
