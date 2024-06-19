import {Component} from '@angular/core';
import {TenantStudentInterface} from "../../classes/tenant.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {StudentInterface} from "../../classes/student.class";
import {DateOrderSingleInterface, orderCustomerSeed} from "../../seed.data";
import {TenantServiceStudent} from "../../service/tenant.service";
import {AccountService} from "../../service/account.serive";
import {StudentService} from "../../service/student.service";
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {forkJoin} from "rxjs";
import {OrderService} from "../../service/order.service";
import {OrderInterfaceStudentSave} from "../../classes/order_student_safe.class";
import {sortOrdersByDate} from "../../functions/order.functions";
import {getTotalPriceSafe, timeDifferenceDay} from "../order-student/order.functions";
import {getStudentNameById} from "../../functions/students.functions";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {GenerellService} from "../../service/generell.service";
import {setDateToCompare} from "../../functions/date.functions";
import {MatDialog} from "@angular/material/dialog";
import {OrderInterfaceStudent} from "../../classes/order_student.class";
import {ConfirmOrderComponent} from "../dialogs/confirm-order/confirm-order.component";
import {getEmailBodyCancel} from "../order-student/email-cancel-order.function";
import {CustomerInterface} from "../../classes/customer.class";
import {SchoolMessageInterface} from "../../classes/school-message.interface";
import {MessageService} from "../../service/message.service";
import {TranslateService} from "@ngx-translate/core";
import {MessageDialogService} from "../../service/message-dialog.service";

function checkMessagesIfSeen(messages: SchoolMessageInterface[], tenant: TenantStudentInterface): SchoolMessageInterface[] {
  if (!tenant.userId) {
    return [];
  }
  let usderId = tenant.userId;
  let messagesArray: SchoolMessageInterface[] = []
  messages.forEach((message) => {
    if (!message.messageSeen.includes(usderId)) {
      messagesArray.push(message)
    }
  })
  return messagesArray;
}

function setOrdersDashboard(orders: OrderInterfaceStudentSave[], registeredStudendts: StudentInterface[], settings: SettingInterfaceNew): DisplayOrderArrayIntrface[] {
  let dateToday = setDateToCompare(new Date())
  let arrayDisplay: DisplayOrderArrayIntrface[] = [];
  if (!orders || !orders.length) return arrayDisplay;
  orders.forEach((order) => {
    let orderCopy$ = JSON.parse(JSON.stringify(order));
    if (setDateToCompare(new Date(order.dateOrder)) >= dateToday)
      arrayDisplay.push({
        dateOrder: order.dateOrder,
        orderedMenus: order.order.orderMenus.map((orderDetail) => {
          return orderDetail.nameOrder
        }).join(', '),
        nameStudent: getStudentNameById(order.studentId, registeredStudendts),
        price: getTotalPriceSafe(order),
        cancelPossible: timeDifferenceDay(settings.orderSettings.deadLineDaily, new Date(order.dateOrder)),
        order: orderCopy$
      })
  })
  return sortOrdersByDate(arrayDisplay);
}

export interface DisplayOrderArrayIntrface {
  dateOrder: Date,
  orderedMenus: string,
  nameStudent: string,
  price: number,
  cancelPossible: number,
  order: OrderInterfaceStudent
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent {

  page: number = 1;
  pageSize: number = 6;
  allMessages: SchoolMessageInterface[] = [];
  tenant!: TenantStudentInterface;
  pageLoaded: boolean = false;
  accountTenant!: AccountCustomerInterface;
  students: StudentInterface[] = [];
  ordersCustomer: DateOrderSingleInterface[] = orderCustomerSeed
  ordersStudentsDisplay: DisplayOrderArrayIntrface[] = [];
  submittingRequest: boolean = false;
  settings!: SettingInterfaceNew;
  customer!: CustomerInterface;
  getTotalPriceSafe = getTotalPriceSafe;

  getShortName(name: string): string {
    return name.length > 6 ? name.slice(0, 6) + '...' : name;
  }

  handleRefresh(event:any) {
    console.log('Begin async operation');
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  }

  constructor(private tenantServiceStudent: TenantServiceStudent,
              private accountService: AccountService,
              private studentService: StudentService,
              private r: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private generalService: GenerellService,
              private dialogService: MessageDialogService,
              private toastr: ToastrService,
              private orderService: OrderService,
              private generallService: GenerellService,
              private messageService: MessageService,
              private translate: TranslateService) {

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
        let reason = this.translate.instant('ACCOUNT.SUCCESS_DEPOSIT_MESSAGE')
        let header = this.translate.instant('ACCOUNT.SUCCESS_DEPOSIT_MESSAGE_HEADER')
        this.dialogService.openMessageDialog(reason, header, 'success');
        this.updateUrlWithoutStatus();
      } else if (status === 'failure') {
        let header = this.translate.instant('ACCOUNT.ERROR_DEPOSIT_MESSAGE_HEADER')
        let reason = this.translate.instant('ACCOUNT.ERROR_DEPOSIT_MESSAGE')
        this.dialogService.openMessageDialog(reason, header, 'error');
        this.updateUrlWithoutStatus();
      }
    })
    // forkJoin(
    //     [
    //         this.messageService.addMessage({
    //             message: 'Für Freitag den 02.07.24 gibt es Lunchpakete für den Ausflug.',
    //             heading: 'Ausflug am Freitag',
    //             messageSeen:[],
    //             sentBy:'school',
    //           createdAt: new Date(),
    //               validTill: new Date('2024-07-02')
    //         }),
    //         this.messageService.addMessage({
    //             message: 'Menü 1: Spaghetti Bolognese, Menü 2 wird geändert zu Nudeln mit Tomatensoße',
    //             heading: 'Menüänderung 03.07.2024',
    //             messageSeen:[],
    //             sentBy:'caterer',
    //           createdAt: new Date(),
    //           validTill: new Date('2024-07-02')
    //
    //         }),
    //         this.messageService.addMessage({
    //             message: 'Es finden Wartungsarbeiten am 05.07.2024 statt. Die Anwendung ist von 11:00 - 12:00 nicht zu erreichen. Wir danken für Ihr Verständnis.',
    //             heading: 'Wartungsarbeiten 05.07.2024',
    //             messageSeen:[],
    //             sentBy:'master',
    //           createdAt: new Date(),
    //           validTill: new Date('2024-07-02')
    //
    //         })
    //     ]
    // ).subscribe({
    //      next: (data) => {
    //
    //      }
    //  })
    this.pageLoaded = false
    forkJoin(
      this.tenantServiceStudent.getTenantInformation(),
      this.accountService.getAccountTenant(),
      this.studentService.getRegisteredStudentsUser(),
      this.orderService.getOrderStudentYear({year: new Date().getFullYear()}),
      this.generallService.getSettingsCaterer(),
      this.generalService.getCustomerInfo(),
      this.messageService.getMessages()
    ).subscribe((
      [
        tenantInformation,
        accountInformation,
        students,
        orderStudents,
        setting,
        customer,
        messages
      ]: [
        TenantStudentInterface,
        AccountCustomerInterface,
        StudentInterface[],
        OrderInterfaceStudentSave[],
        SettingInterfaceNew,
        CustomerInterface,
        SchoolMessageInterface[],
      ]) => {
      this.tenant = tenantInformation;
      this.accountTenant = accountInformation;
      this.students = students;
      this.ordersStudentsDisplay = setOrdersDashboard(orderStudents, students, setting);
      this.settings = setting;
      this.customer = customer
      this.allMessages = checkMessagesIfSeen(messages, tenantInformation);
      this.pageLoaded = true;
    })
  }

  initAfterCancelOrder() {
    forkJoin(
      this.accountService.getAccountTenant(),
      this.orderService.getOrderStudentYear({year: new Date().getFullYear()}),
    ).subscribe((
      [
        accountInformation,
        orderStudents,
      ]: [
        AccountCustomerInterface,
        OrderInterfaceStudentSave[],
      ]) => {
      this.accountTenant = accountInformation;
      this.ordersStudentsDisplay = setOrdersDashboard(orderStudents, this.students, this.settings);
      this.submittingRequest = false;
    })
  }

  routeToAccount(route: string) {
    this.router.navigate(['../home/' + route], {relativeTo: this.r.parent});
  }

  private processEmailAfterCancellation(orderModel: OrderInterfaceStudent, result: any, data: any) {
    const student = this.students.find((student) => student._id === orderModel.studentId);
    if (!student) return;
    const emailObject = {
      orderStudent: orderModel,
      settings: this.settings,
      tenantStudent: this.tenant,
      customerInfo: this.customer,
      weekplanDay: null,
      sendCopyEmail: result.sendCopyEmail,
      selectedStudent: student
    };
    const emailBody = getEmailBodyCancel(emailObject);
    this.generalService.sendEmail(emailBody).subscribe({
      next: (emailResponse) => {
        this.initAfterCancelOrder()
      },
      error: (emailError) => {
        console.error('Fehler beim Senden der E-Mail:', emailError);
        this.toastr.error('Fehler beim Senden der Bestätigungs-E-Mail.');
        this.submittingRequest = false;
      }
    });
  }

  cancelOrder(order: DisplayOrderArrayIntrface) {
    this.submittingRequest = true;
    const dialogRef = this.dialog.open(ConfirmOrderComponent, {
      width: '550px',
      data: {orderStudent: order.order, type: 'cancel', indexMenu: 0, tenantStudent: this.tenant},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.cancelOrderStudent(order.order).subscribe({
          next: (data) => {
            if (data.success) {
              this.toastr.success('Bestellung wurde storniert', 'Erfolgreich');
              if (result.sendCopyEmail) {
                this.processEmailAfterCancellation(order.order, result, data);
              } else {
                this.initAfterCancelOrder()
              }
            } else {
              this.handleOrderCancellationFailure();
            }
          },
          error: (error) => {
            console.error('Fehler beim Stornieren der Bestellung:', error);
            this.handleOrderCancellationFailure();
          }
        });
      } else {
        this.submittingRequest = false
      }
    })
  }

  private handleOrderCancellationFailure() {
    this.toastr.error('Fehler. Die Bestellung konnte nicht storniert werden. Sollte das Problem weiterhin bestehen wenden Sie sich bitte an unseren Kundensupport');
    this.submittingRequest = false;
  }

  closeInfo(message: SchoolMessageInterface) {
    if (!this.tenant || !this.tenant.userId) return;
    message.messageSeen.push(this.tenant.userId)
    this.messageService.editMessage(message).subscribe({
      next: (data) => {
        this.messageService.getMessages().subscribe({
          next: (messages) => {
            this.allMessages = checkMessagesIfSeen(messages, this.tenant);
          }
        })
      }
    })
  }
}
