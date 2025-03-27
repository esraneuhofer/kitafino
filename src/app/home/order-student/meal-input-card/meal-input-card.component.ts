import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {OrderInterfaceStudent, OrderSubDetailNew} from "../../../classes/order_student.class";
import {MealCardInterface} from "../order-container/order-container.component";
import localeDe from '@angular/common/locales/de';
import {registerLocaleData} from "@angular/common";
import {
  getDateMondayFromCalenderweek,
  modifyOrderModelForSave,
  orderIsEmpty,
  orderIsNegative
} from "../../../functions/order.functions";
import {OrderService} from "../../../service/order.service";
import {getDeadlineWeeklyFunction, getWeekNumber, timeDifference, timeDifferenceDay} from "../order.functions";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmOrderComponent} from "../../dialogs/confirm-order/confirm-order.component";
import {getEmailBody} from "../email-order.function";
import {TenantStudentInterface} from "../../../classes/tenant.class";
import {CustomerInterface} from "../../../classes/customer.class";
import {GenerellService} from "../../../service/generell.service";
import {WeekplanDayInterface} from "../../../classes/weekplan.interface";
import {ToastrService} from "ngx-toastr";
import {getEmailBodyCancel} from "../email-cancel-order.function";
import {faShoppingCart, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {forkJoin, of, timeout} from "rxjs";
import {StudentInterface} from "../../../classes/student.class";
import {atLeastOneAllergene, getAllergenes, getTooltipContent} from "../../../functions/allergenes.functions";
import {OrderAllergeneDialogComponent} from "../order-allergene-dialog/order-allergene-dialog.component";
import {getEmailBodyAccountBalance} from "../email-account-balance.function";
import {EXPANSION_PANEL_ANIMATION_TIMING} from "@angular/material/expansion";
import {OrderInterfaceStudentSave} from "../../../classes/order_student_safe.class";
import {AccountService} from "../../../service/account.serive";
import {AccountCustomerInterface} from "../../../classes/account.class";
import {DialogErrorComponent} from "../../../directives/dialog-error/dialog-error.component";
import {TranslateService} from "@ngx-translate/core";
import {LanguageService} from "../../../service/language.service";
import {EinrichtungInterface} from "../../../classes/einrichtung.class";

function checkForDisplay(ordersDay: OrderSubDetailNew, setting: SettingInterfaceNew): boolean {
  let isDisplay = false
  let typeOrder = setting.orderSettings.specials.find(special => {
    special._id === ordersDay.idType
  })
  if (!typeOrder) return isDisplay;

  if (setting.orderSettings.dessertOrderSeparate && typeOrder.typeOrder === 'dessert') {
    return true;
  }
  return isDisplay
}

function studentHasButForDate(orderModel: OrderInterfaceStudent, studentModel: StudentInterface): boolean {
  if(!studentModel.butFrom)return false;
  if (studentModel.butFrom && studentModel.butTo) {

    const dateOrder = new Date(orderModel.dateOrder);
    const butFrom = new Date(studentModel.butFrom);
    const butTo = new Date(studentModel.butTo);

    // Wenn beide Werte existieren, prüfen, ob dateOrder innerhalb des BOT-Zeitraums liegt
    if (dateOrder >= butFrom && dateOrder <= butTo) {
      return true;
    }
  }
  return false;
}
function customSort(array: OrderSubDetailNew[]) {
  // Define the sort order
  const sortOrder: any = {
    'side': 1,
    'menu': 2,
    'specialFood': 3,
    'dessert': 4
  };

  // Custom sort function
  array.sort((a, b) => {
    // Get the order for each type
    let orderA = sortOrder[a.typeOrder];
    let orderB = sortOrder[b.typeOrder];

    // If an item's typeOrder does not exist in sortOrder, consider its order as high to sort it at the end
    if (orderA === undefined) orderA = Infinity;
    if (orderB === undefined) orderB = Infinity;

    // Compare the two orders
    if (orderA < orderB) return -1;
    if (orderA > orderB) return 1;
    return 0;
  });

  return array;
}

function setOrdersSide(ordersWeek: OrderSubDetailNew[], settings: SettingInterfaceNew): OrderSubDetailNew[] {
  //Todo:check for validity flight
  let array: OrderSubDetailNew[] = [];
  ordersWeek.forEach(eachOrder => {
    let isDisplay = checkForDisplay(eachOrder, settings)
    if (isDisplay) {
      array.push(eachOrder)
    }
  })

  return array
}

//Falls Einrichtungen nur den Menü Namen angezeigt bekommen wollen
function getDisplayNameOrder(order: OrderSubDetailNew, customer: CustomerInterface): string {
  if (customer.generalSettings.hideMenuName) {
    return order.nameMenu
  }
  return order.nameOrder
}

function toUTCDate(date: Date): Date {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return utcDate;
}


registerLocaleData(localeDe);

@Component({
  selector: 'app-meal-input-card',
  templateUrl: './meal-input-card.component.html',
  styleUrls: ['./meal-input-card.component.scss'],
})
export class MealInputCardComponent implements OnInit, OnDestroy {

  atLeastOneAllergene = atLeastOneAllergene;
  getTooltipContent = getTooltipContent;
  getAllergenes = getAllergenes;
  getDisplayNameOrder = getDisplayNameOrder;
  @Input() lockDay: boolean = false;
  @Input() indexDay!: number;
  @Input() orderDay!: MealCardInterface
  @Input() settings!: SettingInterfaceNew;
  @Output() orderPlaced: any = new EventEmitter<Event>;
  @Input() tenantStudent!: TenantStudentInterface;
  @Input()einrichtung!:EinrichtungInterface;
  @Input() customer!: CustomerInterface;
  @Input() weekplanDay!: WeekplanDayInterface
  @Input() selectedStudent!: StudentInterface
  @Input() displayMinimize: boolean = false;
  @Input() typeDisplayOrder: string = 'week';
  submittingOrder: boolean = false;
  pastCancelation: boolean = true;

  differenceTimeDeadline: string = '';
  differenceTimeDeadlineDay: string = '';
  timerInterval: any;

  pastOrder: boolean = false;
  pageLoaded: boolean = true;
  submittingRequest: boolean = false;
  faShoppingCart = faShoppingCart;
  faTrashCan = faTrashCan;
  selectedLanguage: string = 'de';

  constructor(private orderService: OrderService,
              private toastr: ToastrService,
              private dialog: MatDialog,
              private generalService: GenerellService,
              private accountService: AccountService,
              private languageService: LanguageService,
              private translate: TranslateService) {
    this.languageService.currentLanguage$.subscribe((language: string) => {
      this.selectedLanguage = language;
    });
  }

  ngOnInit() {
    const orders = customSort(JSON.parse(JSON.stringify(this.orderDay.orderStudentModel.order.orderMenus)))
    const ordersSetSides = setOrdersSide(orders, this.settings)
    this.orderDay.orderStudentModel.order.orderMenus = orders;
    this.checkDeadline(this.orderDay.date);
  }

  getTooltipText(pastOrder: boolean, lockDay: boolean): string {
    if (pastOrder) {
      return this.translate.instant('BESTELLFRIST_ABGELAUFEN');
    } else if (lockDay) {
      return this.translate.instant('SCHLLIESSTAG');
    } else {
      return '';
    }
  }

  getClasses(indexMenu: number, eachMenu: any, pastOrder: boolean, lockDay: boolean): any {

    // Initialize an object with static and conditional classes
    let classes: any = {
      'mt-1': indexMenu !== 0,
      'shadow-lg': true,
      'rounded-lg': true,
      'overflow-hidden': true,
      'cursor-not-allowed': pastOrder, // Conditionally apply cursor-not-allowed class
    };

    // Add dynamic class from getColor method
    const colorClass = this.getColor(eachMenu, lockDay, pastOrder);

    classes[colorClass] = true; // Use the color class name as key and set its value to true

    return classes;
  }

  getColor(menuItem: OrderSubDetailNew, lockDay: boolean, pastOrder: boolean): string {
    if (lockDay || pastOrder) {
      return 'background_greyed_out';
    }

    switch (menuItem.typeOrder) {
      case 'menu':
        return 'background_blue';
      case 'side':
        return 'background_lighter_green';
      case 'dessert':
        return 'background_yellow';
      case 'specialFood':
        return 'background_lightgreen';
      default:
        return 'transparent';  // Default color if value is 0 or not in range
    }
  }

  getEmailBodyData(orderModel: OrderInterfaceStudent, type: string, result: { sendCopyEmail: boolean }) {
    return {
      orderStudent: orderModel,
      settings: this.settings,
      tenantStudent: this.tenantStudent,
      customerInfo: this.customer,
      weekplanDay: this.weekplanDay,
      sendCopyEmail: result.sendCopyEmail,
      selectedStudent: this.selectedStudent
    }
  }

  getEmailBodyDataCancel(orderModel: OrderInterfaceStudent, result: { sendCopyEmail: boolean }) {
    return {
      orderStudent: orderModel,
      settings: this.settings,
      tenantStudent: this.tenantStudent,
      customerInfo: this.customer,
      sendCopyEmail: result.sendCopyEmail,
      selectedStudent: this.selectedStudent
    }
  }

  getMenuStyle(eachMenu: any): any {
    let minHeight = '80px'; // Default min-height for 'side', 'dessert', and 'specialFood'
    if (eachMenu.typeOrder === 'menu' && !this.displayMinimize) {
      minHeight = '140px'; // Set min-height to 140px for 'menu'
    }
    if (eachMenu.typeOrder === 'menu' && this.displayMinimize) {
      minHeight = '80px'; // Set min-height to 140px for 'menu'
    }
    if (eachMenu.typeOrder === 'specialFood' || this.customer.generalSettings.hideMenuName) {
      minHeight = '50px';
    }

    return {'min-height': minHeight};
  }

  showMenuBasedOnSettings(orderModel: OrderSubDetailNew, customer:CustomerInterface, student:StudentInterface): boolean {
    if(customer.generalSettings.hideMenuName && (orderModel.typeOrder === 'side' || orderModel.typeOrder === 'dessert'))return false;
    if(!student.specialFood && !customer.generalSettings.allowOnlyOneMenu)return true;
    if(!customer.generalSettings.allowOnlyOneMenu)return true;
    if(customer.generalSettings.allowOnlyOneMenu && orderModel.idType === student.specialFood || orderModel.typeOrder === 'side' || orderModel.typeOrder === 'dessert'){
      return true;
    }
    if(!student.specialFood && customer.generalSettings.allowOnlyOneMenu && orderModel.typeOrder === 'menu'){
      return true
    }
    return false;
  }

  openAllergenModal(order: OrderSubDetailNew): void {
    if (this.settings.orderSettings.hideNutritionSidebar || this.customer.generalSettings.hideMenuName) return;

    const dialogRef = this.dialog.open(OrderAllergeneDialogComponent, {
      width: 'auto',
      data: {settings: this.settings, menu: order},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });
  }

  private openDialogAndHandleResult(orderModel: OrderInterfaceStudent, type: string, indexMenu: number, onConfirm: (result: {
    sendCopyEmail: boolean
  }) => void): void {
    this.submittingRequest = true;
    const dialogRef = this.dialog.open(ConfirmOrderComponent, {
      width: '550px',
      data: {orderStudent: orderModel, type: type, indexMenu: indexMenu, tenantStudent: this.tenantStudent},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        onConfirm(result);
      } else {
        if (type === 'order') {
          this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = false
          this.orderDay.orderStudentModel.order.orderMenus[indexMenu].amountOrder = 0
        }
        if (type === 'cancel') {
          this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = true
          this.orderDay.orderStudentModel.order.orderMenus[indexMenu].amountOrder = 1
        }
        this.submittingRequest = false;
      }
    });
  }


  checkOrderForOnlyOneMenu(orderModel: OrderInterfaceStudent, indexMenu: number): boolean {
    let copyOrderDay: OrderInterfaceStudent = JSON.parse(JSON.stringify(orderModel))
    copyOrderDay.order.orderMenus[indexMenu].amountOrder = 1
    let orders = 0;
    copyOrderDay.order.orderMenus.forEach((eachOrder) => {
      if (eachOrder.amountOrder > 0) {
        orders++;
      }
    })
    return orders > 1;

  }

  setOrderIconOrder(index: number) {
    if (this.pastOrder || this.lockDay) return;
    this.setOrderDay(true, index)
  }

  setOrderIconCancel(index: number) {
    if (this.pastOrder && this.pastCancelation || this.lockDay) return;
    this.setOrderDay(false, index)
  }


  setOrderDay(event: boolean, indexMenu: number) {
    if (event) {
      if (this.checkOrderForOnlyOneMenu(this.orderDay.orderStudentModel, indexMenu)) {
        setTimeout(() => {
          this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = false
        }, 400)

        const dialogRef = this.dialog.open(DialogErrorComponent, {
          width: '400px',
          data: {
            header: this.translate.instant('FEHLER_BESTELLUNG'),
            message: this.translate.instant('NUR_EINE_BESTELLUNG_PRO_TAG')
          },
          panelClass: 'custom-dialog-container',
          position: {top: '100px'},

        });
        // alert('')
        return
      }
      this.placeOrder(this.orderDay.orderStudentModel, 'order', indexMenu)
    } else {
      this.cancelOrder(this.orderDay.orderStudentModel, indexMenu)
    }
  }

  //Checks if Customer is Below Limit and if Email should be sent Email
  getPromisesEmail(orderModel: OrderInterfaceStudent, type: string, result: {
    sendCopyEmail: boolean
  }, accountTenant: AccountCustomerInterface) {
    let promisesEmail = []
    if (result.sendCopyEmail) {
      const emailObject = this.getEmailBodyData(orderModel, type, result);
      const emailBody = getEmailBody(emailObject);
      promisesEmail.push(this.generalService.sendEmail(emailBody));
    }
    if (this.tenantStudent.orderSettings.sendReminderBalance && !orderModel.isBut) {
      if (accountTenant.currentBalance < this.tenantStudent.orderSettings.amountBalance) {
        const emailReminderAccountBalance = getEmailBodyAccountBalance(this.tenantStudent, accountTenant.currentBalance)
        promisesEmail.push(this.generalService.sendEmail(emailReminderAccountBalance));
      }
    }
    return promisesEmail
  }


  cancelOrder(orderModel: OrderInterfaceStudent, indexMenu: number) {
    this.openDialogAndHandleResult(orderModel, 'cancel', indexMenu, (result: { sendCopyEmail: boolean }) => {
      this.submittingOrder = true;
      this.orderService.cancelOrderStudent(orderModel).subscribe({
        next: (data) => {
          if (data.success) {
            this.toastr.success(this.translate.instant('BESTELLUNG_STORNIERT_ALERT'), this.translate.instant('SUCCESS'));
            if (result.sendCopyEmail) {
              this.processEmailAfterCancellation(orderModel, result, data);
            } else {
              this.orderPlaced.emit(true);
              this.submittingOrder = false;
            }
          } else {
            // Handle the case where success is false but no HTTP error was thrown
            this.handleOrderCancellationFailure(indexMenu);
          }
        },
        error: (error) => {
          console.error('Fehler beim Stornieren der Bestellung:', error);
          this.handleOrderCancellationFailure(indexMenu);
        }
      });
    });
  }

  private processEmailAfterCancellation(orderModel: OrderInterfaceStudent, result: any, data: any) {
    const emailObject = this.getEmailBodyDataCancel(orderModel, result);
    const emailBody = getEmailBodyCancel(emailObject);
    this.generalService.sendEmail(emailBody).subscribe({
      next: (emailResponse) => {
        this.orderPlaced.emit(true);
        this.submittingOrder = false;
      },
      error: (emailError) => {
        this.toastr.error('Fehler beim Senden der Bestätigungs-E-Mail.');
        this.submittingOrder = false;
      }
    });
  }

  private handleOrderCancellationFailure(indexMenu: number) {
    this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = true;
    this.toastr.error('Fehler. Die Bestellung konnte nicht storniert werden. Sollte das Problem weiterhin bestehen wenden Sie sich bitte an unseren Kundensupport');
    this.submittingRequest = false;
    this.submittingOrder = false;
  }

  checkDeadline(day: Date) {

    if (this.customer.generalSettings.isDeadlineDaily) {
      this.checkDeadlineDay(day)
    } else {
      let cw = getWeekNumber(day);
      let year = day.getFullYear();
      this.checkDeadlineWeek(cw, year)
    }
    this.checkDeadlineAbbestellung(day)

  }
  checkDeadlineAbbestellung(day:Date):void{
    let isNotFormat =  !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(this.customer.generalSettings.cancelOrderDaily.time);
    if(!this.customer.generalSettings.cancelOrderDaily ||  isNotFormat){
      this.pastCancelation = true;
      return
    }
    const distance = timeDifferenceDay(this.customer.generalSettings.cancelOrderDaily, day);
    if (distance < 0) {
      this.pastCancelation = true;
      clearInterval(this.timerInterval);
    } else {
      clearInterval(this.timerInterval);
      this.pastCancelation = false;

      this.timerInterval = setInterval(() => {
        this.checkDeadlineAbbestellung(day);
      }, 1000);
    }
  }

  checkDeadlineDay(day: Date): void {

    const distance = timeDifferenceDay(this.customer.generalSettings.deadlineDaily, day);
    // console.log("this.customer.generalSettings.deadlineDaily",this.customer.generalSettings.deadlineDaily)
    // const convertedSeconds = timeDifference(distance,false);
    // const convertedMinutes = timeDifference(distance,true);
    if (new Date(this.einrichtung.startContract).getTime() > day.getTime() || distance < 0) {
      // this.pastOrder = true;
      this.pastOrder = true;
      this.differenceTimeDeadline = this.translate.instant('BESTELLFRIST_ABGELAUFEN');
      this.differenceTimeDeadlineDay = this.translate.instant('BESTELLFRIST_ABGELAUFEN');
      clearInterval(this.timerInterval);
    } else {
      clearInterval(this.timerInterval);
      this.pastOrder = false;
      this.differenceTimeDeadline = timeDifference(distance, true);
      this.differenceTimeDeadlineDay = timeDifference(distance, false);
      this.timerInterval = setInterval(() => {
        this.checkDeadlineDay(day);
      }, 1000);
    }
  }

  checkDeadlineWeek(cw: number, year: number) {
    // this.pastOrder = false;
    // return
    if (!cw || !year) {
      return;
    }
    clearInterval(this.timerInterval);
    let distance = getDeadlineWeeklyFunction(this.customer.generalSettings, cw, getWeekNumber(new Date()), new Date().getFullYear(), year);
    let monday = getDateMondayFromCalenderweek({week: cw, year: year});
    let isPreContract = new Date(this.einrichtung.startContract).getTime() > monday.getTime()
    if (isPreContract || distance < 0) {
      this.pastOrder = true;
      this.differenceTimeDeadline = this.translate.instant('BESTELLFRIST_ABGELAUFEN');
      // this.differenceTimeDeadlineDay = this.translate.instant('BESTELLFRIST_ABGELAUFEN');
      clearInterval(this.timerInterval);
    } else {
      this.pastOrder = false;
      this.differenceTimeDeadline = timeDifference(distance, true);
      this.differenceTimeDeadlineDay = timeDifference(distance, false);
      // this.diff = showDeadline(distance);
      this.timerInterval = setInterval(() => {
        this.checkDeadlineWeek(cw, year);
      }, 1000);
    }
  }


  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  placeOrder(orderModel: OrderInterfaceStudent, type: string, indexMenu: number) {
    this.openDialogAndHandleResult(orderModel, type, indexMenu, (result: { sendCopyEmail: boolean }) => {
      this.submittingOrder = true;
      this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = true;
      this.orderDay.orderStudentModel.order.orderMenus[indexMenu].amountOrder = 1;
      if(studentHasButForDate(orderModel,this.selectedStudent)){
        orderModel.isBut = true;
      }
      let orderModifiedForSave = modifyOrderModelForSave(orderModel);
      this.saveOrder(orderModifiedForSave, type, result, indexMenu);
    });
  }

  private async saveOrder(orderModifiedForSave: any, type: string, result: {
    sendCopyEmail: boolean
  }, indexMenu: number) {
    try {
      const data = await this.orderService.addOrderStudentDay(orderModifiedForSave).toPromise();
      this.handleOrderResponse(data, orderModifiedForSave, type, result, indexMenu);
    } catch (error: any) {
      console.error('Error when placing order:', error);
      this.toastr.error(error.error.message, 'Fehler');
      this.resetOrderSelection(indexMenu);
    }
  }

  private handleOrderResponse(data: any, orderModel: OrderInterfaceStudent, type: string, result: {
    sendCopyEmail: boolean
  }, indexMenu: number) {
    if (data.success) {
      this.toastr.success(this.translate.instant('BESTELLUNG_EINGETRAGEN'), this.translate.instant('SUCCESS'));
      this.fetchAccountAndHandleEmails(orderModel, type, result);
    } else {
      if(data.message === 'Der Kontostand ist nicht ausreichend für diese Bestellung.'){
        this.toastr.error(this.translate.instant('DER_KONTOSTAND_IST_NICHT_AUSREICHEND'), this.translate.instant('ERROR_TITLE'));
      }else{
        this.toastr.error(this.translate.instant('BESTELLUNG_NICHT_EINGETRAGEN'), this.translate.instant('ERROR_TITLE'));
      }
      this.resetOrderSelection(indexMenu);
    }
  }

  private fetchAccountAndHandleEmails(orderModel: OrderInterfaceStudent, type: string, result: {
    sendCopyEmail: boolean
  }) {
    this.accountService.getAccountTenant().subscribe({
      next: (accountTenant: AccountCustomerInterface) => {
        this.handleAccountSuccess(accountTenant, orderModel, type, result);
      },
      error: (error) => {
        console.error('Error retrieving account:', error);
        this.toastr.error('Account Details konnten nicht gefunden werden', 'Fehler');
        this.submittingOrder = false;
      }
    });
  }

  private handleAccountSuccess(
    accountTenant: AccountCustomerInterface,
    orderModel: OrderInterfaceStudent,
    type: string,
    result: { sendCopyEmail: boolean }
  ) {
    if (accountTenant && (result.sendCopyEmail || this.tenantStudent.orderSettings.sendReminderBalance)) {
      const promisesEmail = this.getPromisesEmail(orderModel, type, result, accountTenant);

      // Check if promisesEmail is empty, if so, replace with an observable that emits an empty array
      const emailObservable = promisesEmail.length > 0 ? forkJoin(promisesEmail) : of([]);

      emailObservable.subscribe({
        next: (data: any) => this.finalizeOrder(),
        error: (emailError) => {
          console.error('Error sending emails:', emailError);
          this.toastr.error('Error during email dispatch.', 'Error');
          this.submittingOrder = false;
        }
      });
    } else {
      this.finalizeOrder();
    }
  }

  private resetOrderSelection(indexMenu: number) {
    this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = false;
    this.orderDay.orderStudentModel.order.orderMenus[indexMenu].amountOrder = 0;
    this.submittingOrder = false;
  }

  private finalizeOrder() {
    this.orderPlaced.emit(true);
    this.submittingOrder = false;
  }

}
