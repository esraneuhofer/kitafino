import {Component} from '@angular/core';
import {TenantStudentInterface} from "../../classes/tenant.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {StudentInterface} from "../../classes/student.class";
import {DateOrderSingleInterface, orderCustomerSeed} from "../../seed.data";
import {TenantServiceStudent} from "../../service/tenant.service";
import {AccountService} from "../../service/account.serive";
import {StudentService} from "../../service/student.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {forkJoin} from "rxjs";
import {OrderService} from "../../service/order.service";
import {OrderInterfaceStudentSave} from "../../classes/order_student_safe.class";
import {sortOrdersByDate} from "../../functions/order.functions";
import {getTotalPriceSafe, timeDifference} from "../order-student/order.functions";
import {getStudentNameById} from "../../functions/students.functions";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {GenerellService} from "../../service/generell.service";
import {setDateToCompare} from "../../functions/date.functions";
import {MatDialog} from "@angular/material/dialog";
import {OrderInterfaceStudent} from "../../classes/order_student.class";

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
        cancelPossible: timeDifference(settings.orderSettings.deadLineDaily, new Date(order.dateOrder)),
        order: orderCopy$
      })
  })
  return sortOrdersByDate(arrayDisplay);
}

export interface DisplayOrderArrayIntrface {
  dateOrder: string,
  orderedMenus: string,
  nameStudent: string,
  price: number,
  cancelPossible: string | null,
  order: OrderInterfaceStudent
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent {

  tenant!: TenantStudentInterface;
  pageLoaded: boolean = false;
  accountTenant!: AccountCustomerInterface;
  students: StudentInterface[] = [];
  ordersCustomer: DateOrderSingleInterface[] = orderCustomerSeed
  ordersStudentsDisplay: DisplayOrderArrayIntrface[] = [];
  submittingRequest: boolean = false;
  getTotalPriceSafe = getTotalPriceSafe;
  getShortName(name: string): string {
    return name.length > 6 ? name.slice(0, 6) + '...' : name;
  }
  constructor(private tenantServiceStudent: TenantServiceStudent,
              private accountService: AccountService,
              private studentService: StudentService,
              private r: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private generalService: GenerellService,
              private toastr: ToastrService,
              private orderService: OrderService,
              private generallService: GenerellService) {
  }

  ngOnInit() {
    this.pageLoaded = false
    forkJoin(
      this.tenantServiceStudent.getTenantInformation(),
      this.accountService.getAccountTenant(),
      this.studentService.getRegisteredStudentsUser(),
      this.orderService.getOrderStudentYear({year: new Date().getFullYear()}),
      this.generallService.getSettingsCaterer()
    )
      .subscribe((
        [
          tenantInformation,
          accountInformation,
          students,
          orderStudents,
          setting
        ]: [
          TenantStudentInterface,
          AccountCustomerInterface,
          StudentInterface[],
          OrderInterfaceStudentSave[],
          SettingInterfaceNew
        ]) => {
        this.tenant = tenantInformation;
        this.accountTenant = accountInformation;
        this.students = students;
        this.ordersStudentsDisplay = setOrdersDashboard(orderStudents, students, setting);
        this.pageLoaded = true;
      })
  }

  routeToAccount(route: string) {
    this.router.navigate(['../home/' + route], {relativeTo: this.r.parent});
  }

  // cancelOrder(order:DisplayOrderArrayIntrface){
  //
  //   const dialogRef = this.dialog.open(ConfirmOrderComponent, {
  //     width: '550px',
  //     data: {orderStudent: order.order, type: 'cancel', indexMenu: 0},
  //     panelClass: 'custom-dialog-container',
  //     position: {top: '100px'}
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.submittingRequest = true;
  //       this.orderService.cancelOrderStudent(order.order).subscribe((data: any) => {
  //
  //         if (data.success) {
  //           const emailObject = {
  //             orderStudent: order.order,
  //             settings: this.settings,
  //             tenantStudent: this.tenantStudent,
  //             customerInfo: this.customer,
  //             weekplanDay: this.weekplanDay,
  //             sendCopyEmail: result.sendCopyEmail,
  //             selectedStudent: this.selectedStudent
  //           }
  //           const emailBody = getEmailBodyCancel(emailObject, data.data.priceTotal);
  //           if (this.tenant.orderSettings.orderConfirmationEmail) {
  //             this.generalService.sendEmail(emailBody).subscribe((data: any) => {
  //               this.toastr.success('Bestellung wurde storniert', 'Erfolgreich')
  //               this.submittingRequest = false;
  //             })
  //           } else {
  //             this.toastr.success('Bestellung wurde storniert', 'Erfolgreich')
  //             this.submittingRequest = false;
  //           }
  //
  //         } else {
  //           this.submittingRequest = false;
  //           alert('Fehler. Die Bestellung konnte nicht storniert werden. Sollte das Problem weiterhin bestehen wenden Sie sich bitte an unseren Kundensupport')
  //         }
  //       })
  //     }
  //   })
  // }
  cancelPossible(dateOrder: string): boolean {
    return true
  }

  setOrderArrayDisplay(orderStudent: OrderInterfaceStudentSave): {} {
    return orderStudent.order.orderMenus.map((orderDetail) => {
      return orderDetail.nameOrder
    }).join(', ')
  }

  displayOrderedMenus(orderStudent: OrderInterfaceStudentSave): string {
    return orderStudent.order.orderMenus.map((orderDetail) => {
      return orderDetail.nameOrder
    }).join(', ')
  }


}
