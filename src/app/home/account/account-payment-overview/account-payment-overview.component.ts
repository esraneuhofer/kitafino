import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StudentService} from "../../../service/student.service";
import {forkJoin, Subscription} from "rxjs";
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
import {HttpClient} from "@angular/common/http";
import {PaymentService} from "../../../service/payment-stripe.service";
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {MessageDialogService} from "../../../service/message-dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {Capacitor, PluginListenerHandle} from "@capacitor/core";
import {PlatformService} from "../../../service/platform.service";
import { Plugins } from '@capacitor/core';
import {
  ConfirmStripePaymentComponent
} from "../account-payment/confirm-stripe-payment/confirm-stripe-payment.component";
const { App } = Plugins;

const  arrayPaymentMethods = ['Kreditkarte','Amex', 'Paypal'];
export const  arrayPaymentMethodsName = ['Kreditkarte / Apple Pay / Google Pay','American Express', 'Paypal'];
export function calculateFeeArray(amount: number):{namePayment:string,amountFee:number}[] {
  let arr:{namePayment:string,amountFee:number}[] = [];
  arrayPaymentMethods.forEach((paymentMethod,index) => {
    arr.push({namePayment:arrayPaymentMethodsName[index],amountFee:calculateFee(amount, paymentMethod)})
  })
  return arr;
}

function calculateFee(amount: number, paymentMethod: string): number {
  let feePercentage: number = 0;
  let fixedFee: number = 0;

  // Puffer von 0,1 % hinzufügen
  const buffer = 0.3 / 100;

 if (paymentMethod === 'Paypal') {
    feePercentage = (3.49 / 100) + buffer; // Ergibt 3,59 %
    fixedFee = 0.49;
  } else if (paymentMethod === 'Kreditkarte') {
    feePercentage = (1.4 / 100) + buffer; // Ergibt 1,5 %
    fixedFee = 0.25;
  } else if (paymentMethod === 'Amex') {
    feePercentage = (2.5 / 100) + buffer; // Ergibt 2,6 %
    fixedFee = 0.25;
  }

  const fee = amount * feePercentage + fixedFee;
  return amount - fee - 0.02;
}

function totalAmountExceedsLimit(amount: number | string, account: AccountCustomerInterface, registeredStudents: number): boolean {

  let max = 250;
  if (registeredStudents > 1) {
    max = registeredStudents * 250;
  }

  // Wandelt amount in eine Zahl um, falls es ein String ist
  const amountAsNumber = typeof amount === 'string'
    ? parseFloat(amount)
    : amount;


  return (amountAsNumber + account.currentBalance) > max;
}
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
export class AccountPaymentOverviewComponent implements OnInit, OnDestroy {
  textBanner = '';
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
  hasHandledReturn = false;
  queryParamsSubscription: Subscription = new Subscription();
  private appStateChangeListener: PluginListenerHandle | undefined;

  arrayPaymentMethodsName = arrayPaymentMethodsName;
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
    private r: ActivatedRoute,
    private platformService: PlatformService,
    private translate: TranslateService) {
    this.textBanner = translate.instant('ACCOUNT.ACCOUNT.TEXT_BANNER')
  }
  updateUrlWithoutStatus() {
    console.log('Updating URL without status parameter');
    const navigationExtras: NavigationExtras = {
      queryParams: {}
    };
    this.router.navigate([], navigationExtras);
  }
  ngOnInit() {
    this.queryParamsSubscription =  this.route.queryParams.subscribe(params => {
      const status = params['status'];
      if (status === 'success') {
        let reason = this.translate.instant('ACCOUNT.SUCCESS_DEPOSIT_MESSAGE')
        let header = this.translate.instant('ACCOUNT.SUCCESS_DEPOSIT_MESSAGE_HEADER')
        this.dialogService.openMessageDialog(reason,header, 'success');
        this.updateUrlWithoutStatus();
      } else if (status === 'failure') {
        let header = this.translate.instant('ACCOUNT.ERROR_DEPOSIT_MESSAGE_HEADER')
        let reason = this.translate.instant('ACCOUNT.ERROR_DEPOSIT_MESSAGE')
        this.dialogService.openMessageDialog(reason,header,'error');
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
        console.log('accountTenant',this.accountTenant)
        this.pageLoaded = true;
        console.log('platformService', this.platformService.isIos || this.platformService.isAndroid);

        if (this.platformService.isIos || this.platformService.isAndroid) {
          console.log('Adding appStateChange listener');
          App['addListener']('appStateChange', this.handleAppStateChange).then((listener: PluginListenerHandle) => {
            this.appStateChangeListener = listener;
          });
        }else {
          console.log('Adding focus listener');
          // window.addEventListener('focus', this.handleWindowFocus);
        }
      })
  }
  ngOnDestroy(): void {
    console.log('Component is being destroyed');
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    if (this.platformService.isIos || this.platformService.isAndroid) {
      if (this.appStateChangeListener) {
        console.log('Removing appStateChange listener');
        this.appStateChangeListener.remove();
      }
    } else {
      console.log('Removing focus listener');
      window.removeEventListener('focus', this.handleWindowFocus);
    }
  }
  handleAppStateChange = (state: any) => {
    console.log('App state changed', state);
    if (state.isActive) {
      this.handleStripeReturn();
    }
  }

  handleStripeReturn(): void {
    console.log('Handling Stripe return');
    window.location.reload();
    // const params = new URLSearchParams(window.location.search);
    // console.log('params',params);
    // const paymentStatus = params.get('status');
    // const paymentAmount = params.get('amount');
    // const fullUrl = window.location.href;
    // alert('paymentStatus: ' + paymentStatus + ' paymentAmount: ' + paymentAmount + ' fullUrl: ' + fullUrl)
    // if (paymentStatus && paymentStatus === 'success') {
    //   let reason = this.translate.instant('ACCOUNT.SUCCESS_DEPOSIT_MESSAGE')
    //   let header = this.translate.instant('ACCOUNT.SUCCESS_DEPOSIT_MESSAGE_HEADER')
    //   this.dialogService.openMessageDialog(reason,header, 'success');
    //   this.updateUrlWithoutStatus();
    // } else if (paymentStatus && paymentStatus === 'failure') {
    //   let header = this.translate.instant('ACCOUNT.ERROR_DEPOSIT_MESSAGE_HEADER')
    //   let reason = this.translate.instant('ACCOUNT.ERROR_DEPOSIT_MESSAGE')
    //   this.dialogService.openMessageDialog(reason,header,'error');
    //   this.updateUrlWithoutStatus();
    // }
    //

  }

  handleWindowFocus = (): void => {
    console.log('Window focused');
    this.handleStripeReturn();
  }

  opendialog() {
    // this.handlePayment();
  }

  openDialog() {
    if(!this.tenantStudent.iban || !this.tenantStudent.address || !this.tenantStudent.city || !this.tenantStudent.zip){
      let heading = this.translate.instant('ACCOUNT.ERROR_WITHDRAW_FUNDS')
      let reason = this.translate.instant('ACCOUNT.ERROR_WITHDRAW_FUNDS_NOT_IBAN')
      this.dialogService.openMessageDialog(reason, heading,'warning');
      return;
    }
    if (this.accountTenant.currentBalance === 0) {
      let heading = this.translate.instant('ACCOUNT.ERROR_WITHDRAW_FUNDS')
      let reason = this.translate.instant('ACCOUNT.ERROR_WITHDRAW_FUNDS_NOT_ENOUGH')
      this.dialogService.openMessageDialog(reason,heading,'warning');
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
      accountCharge.emailTenant = this.tenantStudent.email;
      this.chargeService.withdrawFunds(accountCharge).subscribe((response: any) => {
        forkJoin([
          this.chargeService.getAccountCharges(),
          this.accountService.getAccountTenant()
        ]).subscribe(([accountCharges, accountTenant]: [AccountChargeInterface[], AccountCustomerInterface]) => {
          this.accountTenant = accountTenant;
          this.accountCharges = sortAccountChargesByDate(accountCharges);
          const message = this.translate.instant('ACCOUNT.WITHDRAW_DEPOSIT_FUNDS_PROCESSED');
          const header = this.translate.instant('ACCOUNT.WITHDRAW_DEPOSIT_FUNDS_HEADER');
          this.dialogService.openMessageDialog(message, header,'success');
          // this.toastr.success('Abbuchung erfolgreich')
          this.submittingRequest = false;
        })
      })

    });
  }

  copyToClipboard(text: string) {
    this.clipboardService.copyToClipboard(text)
    this.toastr.success(this.translate.instant('ACCOUNT.TEXT_COPIED'));
  }


  isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }
  redirectToStripeCheckout(amount:number | null) {
    if(!amount)return
    if(totalAmountExceedsLimit(amount,this.accountTenant,this.registeredStudents.length)){
      let heading = this.translate.instant('ACCOUNT_HEADER_ERROR_DEPOSIT_FUNDS_LIMIT')
      let reason = this.translate.instant('ACCOUNT_MESSAGE_ERROR_DEPOSIT_FUNDS_LIMIT')
      this.dialogService.openMessageDialog(reason,heading,'warning');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmStripePaymentComponent, {
      width: '550px',
      data: {amount: amount},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result){
        this.submittingRequest = false;
        return;
      }
      if(!this.tenantStudent.userId)return
      this.submittingRequest = true;
      const isIos = this.platformService.isIos
      const isIosAndroid = this.platformService.isAndroid
      console.log("isIos",isIos)
      this.paymentService.redirectToStripeCheckout(amount,this.tenantStudent.userId,this.tenantStudent.username,isIos,isIosAndroid);
      if(isIosAndroid || isIos){
        // this.router.navigate(['../home/dashboard'], {relativeTo: this.route.parent});
        this.submittingRequest = false;

      }

    })


  }
  faClipboard = faClipboard;


  onAmountChange(event: any) {
    this.amountCharge = event.target.value;
    if(!this.amountCharge)return
    this.paymentFeeArray = calculateFeeArray(this.amountCharge);
  }
  goToLink(){
    this.router.navigate(['../home/details_account'], {relativeTo: this.route.parent});
  }

}
