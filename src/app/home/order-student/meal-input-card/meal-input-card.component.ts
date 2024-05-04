import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {OrderInterfaceStudent, OrderSubDetailNew} from "../../../classes/order_student.class";
import {MealCardInterface} from "../order-container/order-container.component";
import localeDe from '@angular/common/locales/de';
import {registerLocaleData} from "@angular/common";
import {modifyOrderModelForSave, orderIsEmpty, orderIsNegative} from "../../../functions/order.functions";
import {OrderService} from "../../../service/order.service";
import {timeDifference} from "../order.functions";
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
import {forkJoin, timeout} from "rxjs";
import {StudentInterface} from "../../../classes/student.class";
import {atLeastOneAllergene, getAllergenes, getTooltipContent} from "../../../functions/allergenes.functions";
import {OrderAllergeneDialogComponent} from "../order-allergene-dialog/order-allergene-dialog.component";
import {getEmailBodyAccountBalance} from "../email-account-balance.function";
import {EXPANSION_PANEL_ANIMATION_TIMING} from "@angular/material/expansion";
import {OrderInterfaceStudentSave} from "../../../classes/order_student_safe.class";
import {AccountService} from "../../../service/account.serive";
import {AccountCustomerInterface} from "../../../classes/account.class";

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

registerLocaleData(localeDe);

@Component({
  selector: 'app-meal-input-card',
  templateUrl: './meal-input-card.component.html',
  styleUrls: ['./meal-input-card.component.scss'],
})
export class MealInputCardComponent implements OnInit, OnDestroy {

  protected readonly atLeastOneAllergene = atLeastOneAllergene;
  protected readonly getTooltipContent = getTooltipContent;
  protected readonly getAllergenes = getAllergenes;
  @Input() lockDay: boolean = false;
  @Input() indexDay!: number;
  @Input() orderDay!: MealCardInterface
  @Input() settings!: SettingInterfaceNew;
  @Output() orderPlaced: any = new EventEmitter<Event>;
  @Input() tenantStudent!: TenantStudentInterface;
  @Input() customer!: CustomerInterface;
  @Input() weekplanDay!: WeekplanDayInterface
  @Input() selectedStudent!: StudentInterface
  @Input() displayMinimize: boolean = false;
  submittingOrder: boolean = false;

  differenceTimeDeadline: string = '';
  timerInterval: any;

  pastOrder: boolean = false;
  pageLoaded: boolean = true;
  submittingRequest: boolean = false;
  faShoppingCart = faShoppingCart;
  faTrashCan = faTrashCan;

  constructor(private orderService: OrderService,
              private toastr: ToastrService,
              private dialog: MatDialog,
              private generalService: GenerellService,
              private accountService: AccountService) {

  }

  ngOnInit() {
    const orders = customSort(JSON.parse(JSON.stringify(this.orderDay.orderStudentModel.order.orderMenus)))
    const ordersSetSides = setOrdersSide(orders, this.settings)
    this.orderDay.orderStudentModel.order.orderMenus = orders;
    this.checkDeadline(this.orderDay.date);
    if (this.selectedStudent.specialFood) {
      this.orderDay.orderStudentModel.order.specialFoodOrder.forEach((eachSpecialFood, index) => {
        if (eachSpecialFood.idSpecialFood === this.selectedStudent.specialFood) {
          this.orderDay.orderStudentModel.order.specialFoodOrder[index].active = true
        }
      })
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

  getColor(menuItem: OrderSubDetailNew, lockDay: boolean, pastOrder: boolean,): string {
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

  getMenuStyle(eachMenu: any): any {
    let minHeight = '80px'; // Default min-height for 'side', 'dessert', and 'specialFood'
    if (eachMenu.typeOrder === 'menu' && !this.displayMinimize) {
      minHeight = '140px'; // Set min-height to 140px for 'menu'
    }
    if (eachMenu.typeOrder === 'menu' && this.displayMinimize) {
      minHeight = '80px'; // Set min-height to 140px for 'menu'
    }

    return {'min-height': minHeight};
  }

  openAllergenModal(order: OrderSubDetailNew): void {
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
      data: {orderStudent: orderModel, type: type, indexMenu: indexMenu},
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

  checkOrder(orderModel: OrderInterfaceStudent): string | null {
    if (orderIsEmpty(orderModel)) return "Bitte wählen Sie mindestens ein Menü aus"
    if (orderIsNegative(orderModel)) return "Es können keine negativen Zahlen bestellt werden" // Irrelevant
    return null;
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


  setOrderIcon(index: number, event: boolean) {
    this.setOrderDay(event, index)
  }

  setOrderDay(event: boolean, indexMenu: number) {
    if (event) {
      if (this.checkOrderForOnlyOneMenu(this.orderDay.orderStudentModel, indexMenu)) {
        setTimeout(() => {
          this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = false
        }, 400)
        return alert('Sie können nur ein Menü pro Tag bestellen')
      }
      this.placeOrder(this.orderDay.orderStudentModel, 'order', indexMenu)
    } else {
      this.cancelOrder(this.orderDay.orderStudentModel, indexMenu)
    }
  }

  //Checks if Customer is Below Limit and if Email should be sent Email
  getPromisesEmail(orderModel: OrderInterfaceStudent, type: string, result: { sendCopyEmail: boolean },accountTenant:AccountCustomerInterface) {
    let promisesEmail = []
    if (this.tenantStudent.orderSettings.orderConfirmationEmail) {
      const emailObject = this.getEmailBodyData(orderModel, type, result);
      const emailBody = getEmailBody(emailObject);
      promisesEmail.push(this.generalService.sendEmail(emailBody));
    }
    if (this.tenantStudent.orderSettings.sendReminderBalance) {
      if (accountTenant.currentBalance < 15) {
        const emailReminderAccountBalance = getEmailBodyAccountBalance(this.tenantStudent, accountTenant.currentBalance)
        promisesEmail.push(this.generalService.sendEmail(emailReminderAccountBalance));
      }

    }
    return promisesEmail
  }


  cancelOrder(orderModel: OrderInterfaceStudent, indexMenu: number) {
    this.openDialogAndHandleResult(orderModel, 'cancel', indexMenu, (result) => {
      this.submittingOrder = true;
      this.orderService.cancelOrderStudent(orderModel).subscribe({
        next: (data) => {
          if (data.success) {
            this.toastr.success('Bestellung wurde storniert', 'Erfolgreich');
            this.processEmailAfterCancellation(orderModel, result, data);
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
    const emailObject = this.getEmailBodyData(orderModel, 'cancel', result);
    const emailBody = getEmailBodyCancel(emailObject, data.data.priceTotal);
    if (this.tenantStudent.orderSettings.orderConfirmationEmail) {
      this.generalService.sendEmail(emailBody).subscribe({
        next: (emailResponse) => {
          this.orderPlaced.emit(true);
          this.submittingOrder = false;
        },
        error: (emailError) => {
          console.error('Fehler beim Senden der E-Mail:', emailError);
          this.toastr.error('Fehler beim Senden der Bestätigungs-E-Mail.');
          this.submittingOrder = false;
        }
      });
    } else {
      this.orderPlaced.emit(true);
      this.submittingOrder = false;
    }
  }

  private handleOrderCancellationFailure(indexMenu:number) {
    this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = true;
    this.toastr.error('Fehler. Die Bestellung konnte nicht storniert werden. Sollte das Problem weiterhin bestehen wenden Sie sich bitte an unseren Kundensupport');
    this.submittingRequest = false;
    this.submittingOrder = false;
  }



  checkDeadline(day: Date): void {
    const distance = timeDifference(this.settings.orderSettings.deadLineDaily, day);
    if (!distance) {
      // this.pastOrder = true;
      this.pastOrder = true;
      this.differenceTimeDeadline = 'Bestellfrist ist abgelaufen!';
      clearInterval(this.timerInterval);
    } else {
      clearInterval(this.timerInterval);
      this.pastOrder = false;
      this.differenceTimeDeadline = distance;
      this.timerInterval = setInterval(() => {
        this.checkDeadline(day);
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  placeOrder(orderModel: OrderInterfaceStudent, type: string, indexMenu: number) {
    this.openDialogAndHandleResult(orderModel, type, indexMenu, (result) => {
      this.submittingOrder = true;
      this.orderDay.orderStudentModel.order.orderMenus[indexMenu].menuSelected = true;
      this.orderDay.orderStudentModel.order.orderMenus[indexMenu].amountOrder = 1;
      let orderModifiedForSave = modifyOrderModelForSave(orderModel);
      this.saveOrder(orderModifiedForSave, type, result, indexMenu);
    });
  }
  private async saveOrder(orderModifiedForSave: any, type: string, result: any, indexMenu: number) {
    try {
      const data = await this.orderService.addOrderStudentDay(orderModifiedForSave).toPromise();
      this.handleOrderResponse(data, orderModifiedForSave, type, result, indexMenu);
    } catch (error:any) {
      console.error('Error when placing order:', error);
      this.toastr.error(error.error.message, 'Fehler');
      this.resetOrderSelection(indexMenu);
    }
  }
  private handleOrderResponse(data: any, orderModel: OrderInterfaceStudent, type: string, result: any, indexMenu: number) {
    if (data.success) {
      this.toastr.success('Bestellung wurde gespeichert', 'Erfolgreich');
      this.fetchAccountAndHandleEmails(orderModel, type, result);
    } else {
      this.toastr.error('Bestellung wurde nicht gespeichert', 'Fehler');
      this.resetOrderSelection(indexMenu);
    }
  }
  private fetchAccountAndHandleEmails(orderModel: OrderInterfaceStudent, type: string, result: any) {
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
  private handleAccountSuccess(accountTenant: AccountCustomerInterface, orderModel: OrderInterfaceStudent, type: string, result: any) {
    if (accountTenant && (this.tenantStudent.orderSettings.orderConfirmationEmail || this.tenantStudent.orderSettings.sendReminderBalance)) {
      const promisesEmail = this.getPromisesEmail(orderModel, type, result, accountTenant);
      forkJoin(promisesEmail).subscribe({
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
