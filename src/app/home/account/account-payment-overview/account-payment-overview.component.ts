import {AfterViewInit, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {StudentService} from "../../../service/student.service";
import {catchError, forkJoin, Subscription, throwError} from "rxjs";
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
import {App as CapacitorApp} from "@capacitor/app";
import {ButService} from "../../../service/but.service";
import {ButStudentInterface} from "../../../classes/but.class";
const { App } = Plugins;

// function hasButAmount(but: ButStudentInterface[],charges:AccountChargeInterface[]): { total: number, amountEinzahlung: number, amountAuszahlung: number } {
//   let total = {
//     total: 0,
//     amountEinzahlung: 0,
//     amountAuszahlung: 0,
//   }
//   if(but.length === 0)return total;
//
//   //Alle Einzahlungen - alle Überweisungen But und alle Rückzahlungne
//   let amount = 0;
//   charges.forEach(charge => {
//     if(charge.reference === 'but_charge'){
//       if(charge.typeCharge === 'deposit'){
//         total.total += charge.amount;
//       }else if(charge.typeCharge === 'withdraw'){
//         total.amountAuszahlung -= charge.amount;
//       }
//     }
//   })
//   return total;
// }


export function getLastButTo(records: ButStudentInterface[]): string | null {
  if (records.length === 0) {
    return null;
  }

  return records
    .map(record => record.butTo)
    .filter(date => date !== null)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;
}

export function compareDatesWithLastButTo(records: ButStudentInterface[], currentDate: Date): boolean {
  const lastButTo = getLastButTo(records);
  if (!lastButTo) {
    return false;
  }

  return new Date(lastButTo).getTime() > new Date(currentDate).getTime();
}


const  arrayPaymentMethods = ['Kreditkarte','Amex', 'Paypal'];
const  arrayPaymentMethodsName = ['Kreditkarte / Apple Pay / Google Pay','American Express', 'Paypal'];
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
    feePercentage = (3.49 / 100) ; // Ergibt 3,59 %
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

export function sortAccountChargesByDate(accountCharges: AccountChargeInterface[]): AccountChargeInterface[] {
  return accountCharges.sort((a, b) => {
    const dateA = a.dateApproved ? new Date(a.dateApproved).getTime() : 0;
    const dateB = b.dateApproved ? new Date(b.dateApproved).getTime() : 0;
    return dateB - dateA;
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
  butTenant: ButStudentInterface[] = [];

  private appStateChangeListener: PluginListenerHandle | undefined;


  arrayPaymentMethodsName = arrayPaymentMethodsName;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private butService: ButService,
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
    private ngZone: NgZone,
    private translate: TranslateService) {
    this.textBanner = translate.instant('ACCOUNT.ACCOUNT.TEXT_BANNER')
  }
  updateUrlWithoutStatus() {
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
      this.butService.getButTenant(),
    ]).subscribe(
      ([
         settings,
         customer,
         students,
         tenantStudent,
         accountCharges,
         accountTenant,
        but
       ]: [
        SettingInterfaceNew,
        CustomerInterface,
        StudentInterface[],
        TenantStudentInterface,
        AccountChargeInterface[],
        AccountCustomerInterface,
        ButStudentInterface[]
      ]) => {

        this.accountCharges = sortAccountChargesByDate(accountCharges);
        this.tenantStudent = tenantStudent
        this.registeredStudents = students;
        this.accountTenant = accountTenant;
        this.pageLoaded = true;
        this.butTenant =  but
        if (this.platformService.isIos || this.platformService.isAndroid) {
          App['addListener']('appStateChange', this.handleAppStateChange).then((listener: PluginListenerHandle) => {
            this.appStateChangeListener = listener;
          });
        }
      })
  }
  onAppResume() {
    this.accountService.getAccountTenant().subscribe((accountTenant: AccountCustomerInterface) => {
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
      this.accountTenant = accountTenant;
    })
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    if (this.platformService.isIos || this.platformService.isAndroid) {
      if (this.appStateChangeListener) {
        this.appStateChangeListener.remove();
      }
      // Unsubscriben Sie alle Subscriptions
    } else {
      window.removeEventListener('focus', this.handleWindowFocus);
    }
  }
  handleAppStateChange = (state: any) => {
    if (state.isActive) {
      this.ngZone.run(() => {
        this.onAppResume();
      });
    }
  }


  handleWindowFocus = (): void => {
    this.onAppResume();
  }

  opendialog() {
    // this.handlePayment();
  }

  openDialog() {
    // let lastDayIsGreaterThenToday = compareDatesWithLastButTo(this.butTenant,new Date())
    // if(lastDayIsGreaterThenToday){
    //   let heading = this.translate.instant('ACCOUNT_HEADER_ERROR_DEPOSIT_FUNDS_BUT')
    //   let reason = this.translate.instant('ACCOUNT_MESSAGE_ERROR_DEPOSIT_FUNDS_BUT')
    //   return;
    // }

    // if(!this.tenantStudent.iban || !this.tenantStudent.address || !this.tenantStudent.city || !this.tenantStudent.zip){
      if(!this.tenantStudent.iban ){
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
      if (!result) {
        this.submittingRequest = false;
        return;
      }

      const accountCharge = new ChargeAccountInterface(
        this.tenantStudent,
        'auszahlung',
        true,
        'auszahlung_anfrage',
        this.accountTenant.currentBalance,
        'auszahlung_bank'
      );

      this.chargeService.withdrawFunds({accountCharge:accountCharge, tenant:this.tenantStudent}).pipe(
        catchError((error) => {
          this.submittingRequest = false;
          const errorMessage = this.translate.instant('ACCOUNT_SUPPORT_ERROR');
          const errorHeader = this.translate.instant('ERROR_TITLE');
          this.dialogService.openMessageDialog(errorMessage, errorHeader, 'error');
          return throwError(() => error);
        })
      ).subscribe({
        next: (response: any) => {
          forkJoin([
            this.chargeService.getAccountCharges(),
            this.accountService.getAccountTenant()
          ]).pipe(
            catchError((error) => {
              this.submittingRequest = false;
              const errorMessage = this.translate.instant('ACCOUNT.SUPPORT_ERROR');
              const errorHeader = this.translate.instant('ACCOUNT.ERROR_HEADER');
              this.dialogService.openMessageDialog(errorMessage, errorHeader, 'error');
              return throwError(() => error);
            })
          ).subscribe({
            next: ([accountCharges, accountTenant]: [AccountChargeInterface[], AccountCustomerInterface]) => {
              this.accountTenant = accountTenant;
              this.accountCharges = sortAccountChargesByDate(accountCharges);
              const message = this.translate.instant('ACCOUNT.WITHDRAW_DEPOSIT_FUNDS_PROCESSED');
              const header = this.translate.instant('ACCOUNT.WITHDRAW_DEPOSIT_FUNDS_HEADER');
              this.dialogService.openMessageDialog(message, header, 'success');
              this.submittingRequest = false;
            },
            error: () => {
              this.submittingRequest = false;
            }
          });
        },
        error: () => {
          this.submittingRequest = false;
        }
      });
    });
  }

  copyToClipboard(text: string) {
    this.clipboardService.copyToClipboard(text)
    this.toastr.success(this.translate.instant('ACCOUNT.TEXT_COPIED'));
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
