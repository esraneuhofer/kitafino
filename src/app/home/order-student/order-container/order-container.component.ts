import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { OrderInterfaceStudent } from "../../../classes/order_student.class";
import { SettingInterfaceNew } from "../../../classes/setting.class";
import { OrderService } from "../../../service/order.service";
import {
  OrderInterfaceStudentSave,
} from "../../../classes/order_student_safe.class";
import { GenerellService } from "../../../service/generell.service";
import { addDayFromDate, getWeekNumber } from "../order.functions";
import { defaultIfEmpty, forkJoin, Observable } from "rxjs";
import { WeekplanMenuInterface } from "../../../classes/weekplan.interface";
import { getMenusForWeekplan, QueryInterOrderInterface } from "../../../functions/weekplan.functions";
import { MenuInterface } from "../../../classes/menu.interface";
import { StudentInterface } from "../../../classes/student.class";
import { getLockDays, normalizeToBerlinDate } from "../../../functions/date.functions";
import { CustomerInterface } from "../../../classes/customer.class";
import { VacationsSubgroupInterface } from "../../../classes/vacation.interface";
import {
  getDateMondayFromCalenderweek,
  setOrderStudent
} from "../../../functions/order.functions";
import { TenantStudentInterface } from "../../../classes/tenant.class";
import { AccountService } from "../../../service/account.serive";
import { AccountCustomerInterface } from "../../../classes/account.class";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { EinrichtungInterface } from "../../../classes/einrichtung.class";
import { VacationStudent } from '../../../service/vacation.service';

dayjs.extend(utc);
dayjs.extend(timezone);


export interface MealCardInterface {
  orderStudentModel: OrderInterfaceStudent,
  lockDay: boolean,
  date: string // Format: 'YYYY-MM-DD'
}

export function isWidthToSmall(input: number): boolean {
  return input <= 767;
}

function getPriceStudentDependingOnSettings(settings: SettingInterfaceNew, eachPrice: {
  priceSpecial: number,
  idSpecial: string,
  nameSpecial?: string,
  typeSpecial: string
}[]): number {
  let priceStudent = 0;
  if (settings.invoiceSettings.differentPricesMenus) {
    //Todo: Add different Prices for each Menu
    eachPrice.forEach(eachPrice => {
      if (eachPrice.typeSpecial === 'menu') {
        if (eachPrice.priceSpecial > priceStudent) {
          priceStudent = eachPrice.priceSpecial;
        }
      }
    })
  } else {
    eachPrice.forEach(eachPrice => {
      if (eachPrice.typeSpecial === 'menu') {
        if (eachPrice.priceSpecial > priceStudent) {
          priceStudent = eachPrice.priceSpecial;
        }
      }
    })
  }
  return priceStudent;
}


export function setOrderDayStudent(order: (OrderInterfaceStudentSave | null),
  weekplanSelectedWeek: WeekplanMenuInterface,
  settings: SettingInterfaceNew,
  customer: CustomerInterface,
  selectedStudent: any, indexDaySelected: number,
  selectedDate: string, // Format: 'YYYY-MM-DD'
  query: { week: number, year: number },
  lockDays: boolean[],
  contractSettings: EinrichtungInterface): MealCardInterface {
  const orderModelStudent = setOrderStudent(
    order,
    weekplanSelectedWeek,
    settings,
    customer,
    selectedStudent,
    indexDaySelected,
    selectedDate, // selectedDate ist bereits ein string
    query,
    contractSettings);
  return {
    orderStudentModel: orderModelStudent,
    lockDay: lockDays[indexDaySelected],
    date: selectedDate // selectedDate ist bereits ein string
  }
}

@Component({
  selector: 'app-order-container',
  templateUrl: './order-container.component.html',
  styleUrls: ['./order-container.component.scss'],
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
  @Input() allVacations: VacationsSubgroupInterface[] = [];
  @Input() allVacationsTenant: VacationStudent[] = [];
  @Input() selectedWeekplan!: WeekplanMenuInterface;
  @Input() schoolSettings!: EinrichtungInterface;
  orderWeek: MealCardInterface[] = [];
  accountTenant?: AccountCustomerInterface

  displayMinimize: boolean = false;

  lockDays: boolean[] = [];
  @Output() orderPlacedNew: any = new EventEmitter<Event>();
  isLocked: boolean = false;
  pageLoaded: boolean = false;
  query: { week: number; year: number } = { week: 0, year: 0 };

  constructor(private orderService: OrderService,
    private accountService: AccountService,
    private generellService: GenerellService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['querySelection']) {
      this.querySelection = { ...changes['querySelection'].currentValue }
      this.query = this.querySelection
      this.getDataWeek();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.displayMinimize = isWidthToSmall(event.target.innerWidth);
  }

  ngOnInit() {
    this.displayMinimize = isWidthToSmall(window.innerWidth);
  }

  getDataWeek() {
    this.orderPlacedNew.emit()
    this.orderWeek = [];
    this.pageLoaded = false;
    const dateMonday = getDateMondayFromCalenderweek(this.query);
    const delayObservable = new Observable(observer => {
      setTimeout(() => observer.next(), 1000); // 1000 ms delay
    });
    forkJoin([
      this.accountService.getAccountTenant(),
      this.generellService.getWeekplanWeek(this.query),

    ]).subscribe(([accountTenant, weekplan]: [AccountCustomerInterface, WeekplanMenuInterface]) => {
      this.accountTenant = accountTenant;

      ///Sets the Weekplan from Catering Company with Menus and Allergenes
      const weekplanSelectedWeek = getMenusForWeekplan(weekplan, this.menus, this.settings, this.query);
      ///Sets the Lockdays Array, Vacation Customer or State Holiday
      this.lockDays = getLockDays(dateMonday.toString(), this.allVacations, this.allVacationsTenant, this.customer.generalSettings.state, this.selectedStudent.subgroup);
      let promiseOrderWeek = [];
      for (let i = 0; i < 5; i++) {
        let dateToSearch = dayjs(addDayFromDate(dateMonday, i)).tz('Europe/Berlin').format();
        promiseOrderWeek.push(this.orderService.getOrderStudentDay({
          dateOrder: dateToSearch,
          studentId: this.selectedStudent._id || ''
        }))
      }
      forkJoin(promiseOrderWeek).pipe(
        defaultIfEmpty([null]),
      ).subscribe((order: (OrderInterfaceStudentSave | null)[]) => {
        for (let i = 0; i < 5; i++) {
          let date = addDayFromDate(dateMonday, i)
          let dateFormatted = normalizeToBerlinDate(date);
          this.orderWeek.push(setOrderDayStudent(order[i], weekplanSelectedWeek, this.settings, this.customer, this.selectedStudent, i, dayjs.tz(date, 'Europe/Berlin').format('YYYY-MM-DD'), this.query, this.lockDays, this.schoolSettings))
        }
        this.pageLoaded = true;

      })
    })
  }

}
