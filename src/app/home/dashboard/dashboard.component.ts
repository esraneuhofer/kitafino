import { Component } from '@angular/core';
import {TenantStudentInterface} from "../../classes/tenant.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {StudentInterface} from "../../classes/student.class";
import {DateOrderSingleInterface, orderCustomerSeed} from "../../seed.data";
import {TenantServiceStudent} from "../../service/tenant.service";
import {AccountService} from "../../service/account.serive";
import {StudentService} from "../../service/student.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {LoadingService} from "../../service/loading.service";
import {UserService} from "../../service/user.service";
import {forkJoin} from "rxjs";
import {OrderService} from "../../service/order.service";
import {OrderInterfaceStudentSave} from "../../classes/order_student_safe.class";
import {sortOrdersByDate} from "../../functions/order.functions";
import {getTotalPriceSafe, timeDifference} from "../order-student/order.functions";
import {getStudentNameById} from "../../functions/students.functions";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {GenerellService} from "../../service/generell.service";
import {setDateToCompare} from "../../functions/date.functions";

function setOrdersDashboard(orders:OrderInterfaceStudentSave[],registeredStudendts:StudentInterface[],settings:SettingInterfaceNew):DisplayOrderArrayIntrface[]{
  let dateToday = setDateToCompare(new Date())
  let arrayDisplay:DisplayOrderArrayIntrface[] = [];
  if(!orders || !orders.length)return arrayDisplay;
  orders.forEach((order) => {
    if(setDateToCompare(new Date(order.dateOrder)) >= dateToday)
    arrayDisplay.push({
      dateOrder: order.dateOrder,
      orderedMenus: order.order.orderMenus.map((orderDetail) => {
        return orderDetail.nameOrder
      }).join(', '),
      nameStudent: getStudentNameById(order.studentId,registeredStudendts),
      price: getTotalPriceSafe(order),
      cancelPossible:  timeDifference(settings.orderSettings.deadLineDaily, new Date(order.dateOrder)),
    })
  })
  return sortOrdersByDate(arrayDisplay);
}
export interface DisplayOrderArrayIntrface{
  dateOrder: string,
  orderedMenus: string,
  nameStudent: string,
  price: number,
  cancelPossible: string | null,
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent {

  tenant!:TenantStudentInterface;
  pageLoaded:boolean = false;
  accountTenant!:AccountCustomerInterface;
  students:StudentInterface[] = [];
  ordersCustomer:DateOrderSingleInterface[] = orderCustomerSeed
  ordersStudentsDisplay:DisplayOrderArrayIntrface[] = [];

  getTotalPriceSafe = getTotalPriceSafe;
  constructor(private tenantServiceStudent: TenantServiceStudent,
              private accountService:AccountService,
              private studentService:StudentService,
              private r: ActivatedRoute,
              private router:Router,
              private toastr: ToastrService,
              private loadingService: LoadingService,
              private orderService: OrderService,
              private generallService:GenerellService) {
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
        [tenantInformation,accountInformation,students,orderStudents,setting]:
          [TenantStudentInterface,AccountCustomerInterface,StudentInterface[],OrderInterfaceStudentSave[],SettingInterfaceNew]) =>{
        this.tenant = tenantInformation;
        this.accountTenant = accountInformation;
        this.students = students;
        this.ordersStudentsDisplay = setOrdersDashboard(orderStudents,students,setting);
        this.loadingService.hide();
        this.pageLoaded = true;
      })
  }

  routeToAccount(route:string){
    this.router.navigate(['../home/' + route], {relativeTo: this.r.parent});
  }

  cancelPossible(dateOrder: string): boolean {
    return true
  }

  setOrderArrayDisplay(orderStudent: OrderInterfaceStudentSave): { } {
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
