import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {OrderInterfaceStudent} from "../../../classes/order_student.class";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {OrderService} from "../../../service/order.service";
import {
  OrderInterfaceStudentSave,
} from "../../../classes/order_student_safe.class";
import {GenerellService} from "../../../service/generell.service";
import {addDayFromDate, getWeekNumber} from "../order.functions";
import {defaultIfEmpty, forkJoin} from "rxjs";
import {WeekplanMenuInterface} from "../../../classes/weekplan.interface";
import {getMenusForWeekplan, QueryInterOrderInterface} from "../../../functions/weekplan.functions";
import {MenuInterface} from "../../../classes/menu.interface";
import {StudentInterface} from "../../../classes/student.class";
import {getLockDays} from "../../../functions/date.functions";
import {CustomerInterface} from "../../../classes/customer.class";
import {VacationsInterface} from "../../../classes/vacation.interface";
import {
  getDateMondayFromCalenderweek,
  setOrderStudent
} from "../../../functions/order.functions";
import * as moment from 'moment-timezone';
import {TenantStudentInterface} from "../../../classes/tenant.class";


export interface MealCardInterface {
  orderStudentModel: OrderInterfaceStudent,
  lockDay: boolean,
  date: Date
}

function setOrderDayStudent(order: (OrderInterfaceStudentSave | null),
                            weekplanSelectedWeek: WeekplanMenuInterface,
                            settings: SettingInterfaceNew,
                            customer: CustomerInterface,
                            selectedStudent: StudentInterface, indexDaySelected: number,
                            selectedDate: Date, query: { week: number, year: number },
                            lockDays: boolean[]): MealCardInterface {
  const orderModelStudent = setOrderStudent(
    order,
    weekplanSelectedWeek,
    settings,
    customer,
    selectedStudent,
    indexDaySelected,
    selectedDate.toString(),
    query);
  return {
    orderStudentModel: orderModelStudent,
    lockDay: lockDays[indexDaySelected],
    date: selectedDate
  }
}

@Component({
  selector: 'app-order-container',
  templateUrl: './order-container.component.html',
  styleUrls: ['./order-container.component.scss']
})
export class OrderContainerComponent implements OnInit, OnChanges {

  @Input() settings!: SettingInterfaceNew;
  @Input() querySelection!: QueryInterOrderInterface;
  @Input() indexDaySelected!: number;
  @Input() pastOrder!: boolean;
  @Input() menus!: MenuInterface[]
  @Input() selectedStudent!: StudentInterface;
  @Input() customer!: CustomerInterface;
  @Input() tenantStudent!: TenantStudentInterface;
  @Input() allVacations!: VacationsInterface[];
  @Input() selectedWeekplan!: WeekplanMenuInterface;
  orderWeek: MealCardInterface[] = [];

  @Output() orderPlaced: any = new EventEmitter<Event>();
  isLocked: boolean = false;
  pageLoaded: boolean = false;
  query: { week: number; year: number } = {week: 0, year: 0};

  constructor(private orderService: OrderService, private generellService: GenerellService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['querySelection']) {
      this.querySelection = {... changes['querySelection'].currentValue}
      this.query = this.querySelection
      this.getDataWeek();
    }
  }

  ngOnInit() {
    // this.query = {year: new Date(this.selectedDate).getFullYear(), week: getWeekNumber(new Date(this.selectedDate))}
    // this.getDataWeek()
  }


  getDataWeek() {
    this.orderWeek = [];
    this.pageLoaded = false;
    const dateMonday = getDateMondayFromCalenderweek(this.query);
    this.generellService.getWeekplanWeek(this.query).subscribe((weekplan: WeekplanMenuInterface) => {
      ///Sets the Weekplan from Catering Company with Menus and Allergenes
      const weekplanSelectedWeek = getMenusForWeekplan(weekplan, this.menus, this.settings, this.query);
      ///Sets the Lockdays Array, Vacation Customer or State Holiday
      const lockDays = getLockDays(dateMonday.toString(), this.allVacations, this.customer.stateHol);

      let promiseOrderWeek = [];
      for (let i = 0; i < 5; i++) {
        let dateToSearch = moment.tz(addDayFromDate(dateMonday, i), 'Europe/Berlin').format()
        promiseOrderWeek.push(this.orderService.getOrderStudentDay({dateOrder: dateToSearch, studentId: this.selectedStudent._id || ''}))
      }
      forkJoin(promiseOrderWeek).pipe(
        defaultIfEmpty([null]),
      ).subscribe((order: (OrderInterfaceStudentSave | null)[]) => {
        for (let i = 0; i < 5; i++) {
          let date = addDayFromDate(dateMonday, i)
          this.orderWeek.push(setOrderDayStudent(order[i], weekplanSelectedWeek, this.settings, this.customer, this.selectedStudent, i, date, this.query, lockDays))
        }
        this.pageLoaded = true;
      })
    })
  }


  editOrder() {

  }

  deleteOrder() {

  }

  setOrderDay() {
    // this.assignedWeekplanSelected = setWeekplanModelGroups(this.weekplanSelectedWeek, {
    //   year: year,
    //   week: calenderWeek
    // }, data[1], this.customerInfo, this.weekplanGroups,this.settings);
    // this.orderModel = null;
    // if (this.settings.orderSettings.sideOrDessertChoose) {
    //   this.sideDessertSelection = getSideDessertSelection(this.orderModel.order, this.settings, this.customerInfo);
    // }
    // this.checkDeadline(event);
    // this.indexDaySelected = indexDay - 1;aa
    // this.selectedOrderCopy = JSON.parse(JSON.stringify(this.orderModel));
    // this.pageLoaded = true;
    // this.getOrderSubmitting = false;
    // this.submittingRequest = false;
  }

}
