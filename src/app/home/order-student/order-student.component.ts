import {Component, HostListener, NgZone, OnDestroy, OnInit} from '@angular/core';
import {addDayFromDate, getDisplayOrderType, getNextFiveWorkdays, getSplit, getWeekNumber} from "./order.functions";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {GenerellService} from "../../service/generell.service";
import {combineLatest, defaultIfEmpty, forkJoin, map, Subscription, timer} from "rxjs";
import {CustomerInterface} from "../../classes/customer.class";
import {WeekplanMenuInterface} from "../../classes/weekplan.interface";
import {MealModelInterface} from "../../classes/meal.interface";
import {MenuInterface} from "../../classes/menu.interface";
import {ArticleDeclarations} from "../../classes/allergenes.interface";
import {ArticleInterface} from "../../classes/article.interface";
import {getMealsWithArticle, getMenusWithMealsAndArticle} from "../../functions/meal.functions";
import {VacationsSubgroupInterface} from "../../classes/vacation.interface";
import {StudentInterface} from "../../classes/student.class";
import {StudentService} from "../../service/student.service";
import {ToastrService} from "ngx-toastr";
import {getMenusForWeekplan, QueryInterOrderInterface} from "../../functions/weekplan.functions";
import {TenantServiceStudent} from "../../service/tenant.service";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {
  AssignedWeekplanInterface,
  setWeekplanModelGroups,
  WeekplanGroupClass,
  WeekplanGroupSelection
} from "../../classes/assignedWeekplan.class";
import {AccountService} from "../../service/account.serive";
import {AccountCustomerInterface} from "../../classes/account.class";
import {formatDateToISO, getDateMondayFromCalenderweek} from "../../functions/order.functions";
import {checkDayWeekend, getCustomDayIndex, getLockDays, normalizeToBerlinDate} from "../../functions/date.functions";
import {OrderInterfaceStudentSave} from "../../classes/order_student_safe.class";
import {isWidthToSmall, MealCardInterface, setOrderDayStudent} from "./order-container/order-container.component";
import {OrderService} from "../../service/order.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ToastingService} from "../../service/toastr.service";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import {FirstAccessDialogComponent} from "../../directives/first-access-dialog/first-access-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {
  FirstAccessOrderDialogComponent
} from "../../directives/first-access-order-dialog/first-access-order-dialog.component";
import {SchoolService} from "../../service/school.service";
import {App, App as CapacitorApp} from "@capacitor/app";
import {Capacitor, PluginListenerHandle} from "@capacitor/core";
import {EinrichtungInterface} from "../../classes/einrichtung.class";
import {  VacationService, VacationStudent } from '../../service/vacation.service';

dayjs.extend(utc);
dayjs.extend(timezone);


@Component({
  selector: 'app-order-student',
  templateUrl: './order-student.component.html',
  styleUrls: ['./order-student.component.scss']
})
export class OrderStudentComponent implements OnInit, OnDestroy {

  textBannerWeekend: string = 'Am Wochenende kann keine Bestellung aufgegeben werden';
  isWeekend: boolean = false;
  displayOrderTypeWeek: boolean = true
  indexDay: number = 0;
  initStudent: boolean = false;
  mainDataLoaded: boolean = false;
  textBanner = '';
  pageLoaded: boolean = false;
  studentNoSubgroup: boolean = false;
  lockDays: boolean[] = [];
  displayMinimize: boolean = false;
  selectedDay: string = normalizeToBerlinDate(new Date());
  showErrorNoStudents: boolean = false; // Show if no Students is registered yet
  registeredStudents: StudentInterface[] = [];
  subGroupsCustomer: string[] = []; //Subgroup
  querySelection: QueryInterOrderInterface = {week: 0, year: 0}
  customer!: CustomerInterface;
  selectedWeekplan!: WeekplanMenuInterface;
  meals!: MealModelInterface[];
  menus!: MenuInterface[];
  articleDeclarations!: ArticleDeclarations;
  articles!: ArticleInterface[];
  settings!: SettingInterfaceNew;
  allVacations: VacationsSubgroupInterface[] = [];
  selectedStudent: (StudentInterface | null) = null;
  tenantStudent!: TenantStudentInterface;
  assignedWeekplanSelected!: AssignedWeekplanInterface;
  weekplanGroups: WeekplanGroupClass[] = [];
  accountTenant!: AccountCustomerInterface;
  weekplanSelectedWeek: (WeekplanMenuInterface | null) = null;
  orderWeek: MealCardInterface[] = [];
  schoolSettings!: EinrichtungInterface;
  vacationsStudent: VacationStudent[] = [];
  weekplanGroupSelection: WeekplanGroupSelection | null = null;
  private appStateChangeListener: PluginListenerHandle | undefined;
  private subscriptions: Subscription = new Subscription();

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.displayMinimize = isWidthToSmall(event.target.innerWidth);
  }

  goToChargeMoney() {
    this.router.navigate(['../home/account_overview'], {relativeTo: this.r.parent});
  }

  constructor(private generellService: GenerellService,
              private vacationService: VacationService,
              private toastr: ToastrService,
              private tenantService: TenantServiceStudent,
              private studentService: StudentService,
              private accountService: AccountService,
              private orderService: OrderService,
              private router: Router,
              private dialog: MatDialog,
              private translate: TranslateService,
              private toastrService: ToastingService,
              private schoolService: SchoolService,
              private ngZone: NgZone,
              private r: ActivatedRoute) {
    this.textBanner = translate.instant("NO_STUDENT_REGISTERED_BANNER_TEXT")
    this.textBannerWeekend = translate.instant("WEEKEND_NO_ORDER")
  }


  onAppResume() {
    this.pageLoaded = false;

    this.loadData();
  }

  ngOnDestroy() {
    if (Capacitor.isNativePlatform()) {
      if (this.appStateChangeListener) {
        this.appStateChangeListener.remove();
      }
    } else {
      window.removeEventListener('focus', this.handleWindowFocus);
    }
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
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

  ngOnInit() {
    this.displayMinimize = isWidthToSmall(window.innerWidth);
    if (this.displayMinimize) {
      this.displayOrderTypeWeek = false;
    }
    this.querySelection = {year: new Date().getFullYear(), week: getWeekNumber(new Date())};
    this.loadData()
    if (Capacitor.isNativePlatform()) {
      App['addListener']('appStateChange', this.handleAppStateChange).then((listener: PluginListenerHandle) => {
        this.appStateChangeListener = listener;
      });
    }
  }

  loadData() {
    forkJoin([
      this.generellService.getSettingsCaterer(),
      this.generellService.getCustomerInfo(),
      this.generellService.getWeekplanWeek(this.querySelection),
      this.generellService.getMeals(),
      this.generellService.getMenus(),
      this.generellService.getArticleDeclaration(),
      this.generellService.getArticle(),
      this.studentService.getRegisteredStudentsUser(),
      this.tenantService.getTenantInformation(),
      this.generellService.getAssignedWeekplan(this.querySelection),
      this.generellService.getWeekplanGroups(),
      this.accountService.getAccountTenant(),
      this.generellService.getVacationCustomer(),
      this.schoolService.getSchoolSettings(),
      this.generellService.getWeekplanGroupSelection(),

    ]).subscribe(
      ([
         settings,
         customer,
         weekplan, // Assuming this is of type WeekplanMenuInterface
         meals,
         menus,
         articleDeclarations,
         articles,
         students,
         tenantStudent,
         assignedWeekplans,
         weekplanGroups,
         accountTenant,
         vacations,
         schoolSettings,
         weekplanGroupSelection
       ]: [
        SettingInterfaceNew,
        CustomerInterface,
        WeekplanMenuInterface, // Adjust the type here
        MealModelInterface[],
        MenuInterface[],
        ArticleDeclarations,
        ArticleInterface[],
        StudentInterface[],
        TenantStudentInterface,
        AssignedWeekplanInterface[],
        WeekplanGroupClass[],
        AccountCustomerInterface,
        VacationsSubgroupInterface[],
        EinrichtungInterface,
        WeekplanGroupSelection
      ]) => {
        this.settings = settings;
        this.customer = customer;
        this.meals = getMealsWithArticle(meals, articles, articleDeclarations);
        this.menus = getMenusWithMealsAndArticle(menus, this.meals);
        this.registeredStudents = students;
        this.articleDeclarations = articleDeclarations;
        this.articles = articles;
        this.subGroupsCustomer = getSplit(this.customer); //Gets customer splits
        this.selectedWeekplan = getMenusForWeekplan(weekplan, menus, this.settings, this.querySelection);
        this.assignedWeekplanSelected = setWeekplanModelGroups(this.selectedWeekplan, this.querySelection, assignedWeekplans, customer, weekplanGroups, settings, weekplanGroupSelection);
        this.tenantStudent = tenantStudent;
        this.accountTenant = accountTenant;
        this.allVacations = vacations;
        this.schoolSettings = schoolSettings;
        this.displayOrderTypeWeek = getDisplayOrderType(tenantStudent, this.displayOrderTypeWeek)
        this.weekplanGroups = weekplanGroups;
        this.weekplanGroupSelection = weekplanGroupSelection;
        this.mainDataLoaded = true;
        if (!this.schoolSettings) {
          this.toastr.error('Keine Schuleinstellungen gefunden')
          return
        }
        if (this.tenantStudent.firstAccessOrder) {
          const dialogRef = this.dialog.open(FirstAccessOrderDialogComponent, {
            width: '600px',
            data: {customer: customer, tenant: tenantStudent},
            panelClass: 'custom-dialog-container',
            position: {top: '20px'}
          });
        }
        this.setFirstInit(weekplan)
      },
      (error) => {
        console.error('An error occurred:', error);
        this.toastr.error(error.error.message, 'Fehler')
        // Handle errors as needed.
      }
    );
  }

  changeDate(queryDate: QueryInterOrderInterface): void {
    this.querySelection = {...queryDate};
    this.getDataWeek()
  }

  editSettings(event: boolean): void {
    this.pageLoaded = true;
    this.tenantStudent.orderSettings.displayTypeOrderWeek = event;
    this.tenantService.editParentTenant(this.tenantStudent).subscribe((response) => {
      window.location.reload();
    })
  }

  changeDateDay(queryDate: string): void {

    // Kein normalize mehr nötig, da queryDate bereits im Format YYYY-MM-DD ist
    this.selectedDay = queryDate;
    this.orderWeek = [];
    this.pageLoaded = false;

    // Extrahiere Jahr und erstelle ein dayjs Objekt für weitere Berechnungen
    const dateObj = dayjs(queryDate);
    const year = dateObj.year();
    const week = getWeekNumber(queryDate);

    const dateMonday = getDateMondayFromCalenderweek({
      week: week,
      year: year
    });


    this.querySelection = {
      week: week,
      year: year
    };

    if (!this.selectedStudent || !this.selectedStudent?._id) {
      this.pageLoaded = true;
      return;
    }
    this.isWeekend = checkDayWeekend(queryDate);
    if (this.isWeekend) {
      this.pageLoaded = true;
      return;
    }

    this.indexDay = getCustomDayIndex(queryDate);

    // Create a timer observable for 0.4 seconds
    const delay$ = timer(400);

    // Combine the delay observable with the forkJoin observable
    combineLatest([
      forkJoin([
        this.accountService.getAccountTenant(),
        this.generellService.getWeekplanWeek(this.querySelection),
        this.orderService.getOrderStudentDay({
          dateOrder: queryDate,
          studentId: this.selectedStudent._id
        }),
        this.vacationService.getAllVacationStudentByStudentId(this.selectedStudent._id)
      ]),
      delay$
    ]).pipe(
      map(([results]) => results as [AccountCustomerInterface, WeekplanMenuInterface, (OrderInterfaceStudentSave | null), VacationStudent[]])
    ).subscribe(([accountTenant, weekplan, orderStudent, vacationsStudent]: [AccountCustomerInterface, WeekplanMenuInterface, (OrderInterfaceStudentSave | null), VacationStudent[]]) => {
      this.accountTenant = accountTenant;
      this.vacationsStudent = vacationsStudent;
      // Sets the Weekplan from Catering Company with Menus and Allergens
      this.selectedWeekplan = getMenusForWeekplan(
        weekplan,
        this.menus,
        this.settings,
        this.querySelection
      );
      if (!this.selectedStudent || !this.selectedStudent?._id) {
        this.pageLoaded = true;
        return;
      }
      // Sets the Lockdays Array, Vacation Customer or State Holiday
      this.lockDays = getLockDays(
        dateMonday.toString(),
        this.allVacations,
        this.vacationsStudent,
        this.customer.generalSettings.state,
        this.selectedStudent.subgroup
      );

      if (!this.selectedStudent) return;

      this.orderWeek.push(
        setOrderDayStudent(
          orderStudent,
          this.selectedWeekplan,
          this.settings,
          this.customer,
          this.selectedStudent,
          this.indexDay,
          new Date(queryDate), // Hier direkt das String-Datum verwenden
          this.querySelection,
          this.lockDays,
          this.schoolSettings
        )
      );

      this.pageLoaded = true;
    });
  }

  getOrderDay(queryDate: QueryInterOrderInterface): void {
    if (!this.selectedStudent) {
      this.toastr.warning(this.translate.instant('ORDER_STUDENT_PLEASE_SELECT_STUDENT'));
      this.pageLoaded = true;
      // this.fetchingOrder = false;
      return
    }
    if (!this.selectedWeekplan) return;
    this.getOrdersWeekStudent(this.selectedStudent, queryDate, this.selectedWeekplan)
  }

  selectStudentSingle(student: StudentInterface | null) {
    this.pageLoaded = false;
    if (!this.selectedDay) {
      this.toastr.error(this.translate.instant('ORDER_STUDENT_SELECT_DAY'))
      return;
    }
    if (this.checkForErrors(student)) {
      return;
    }
    this.selectedStudent = student;
    this.changeDateDay(this.selectedDay)
  }

  selectStudent(student: StudentInterface | null) {
    this.pageLoaded = false;
    if (this.checkForErrors(student)) {
      return;
    }
    if (!this.initStudent) {
      this.initStudent = true;
      return;
    }
    this.selectedStudent = student;
    this.getOrderDay(this.querySelection)
  }

  checkForErrors(selectedStudent: StudentInterface | null): boolean {
    this.studentNoSubgroup = false;
    if (!selectedStudent) {
      this.toastr.warning(this.translate.instant('ORDER_STUDENT_PLEASE_SELECT_STUDENT'));
      this.pageLoaded = true;
      return true
    }
    if (!selectedStudent.subgroup) {
      this.studentNoSubgroup = true;
      this.pageLoaded = true;
      this.toastr.warning(this.translate.instant('ORDER_STUDENT_NO_SUBGROUP_SELECTED'));
      return true
    }
    return false;
  }

  setFirstInit(weekplanSelectedWeek: WeekplanMenuInterface) {
    const dateMonday = getDateMondayFromCalenderweek(this.querySelection);
    this.selectedWeekplan = getMenusForWeekplan(weekplanSelectedWeek, this.menus, this.settings, this.querySelection);
    if(!this.registeredStudents || this.registeredStudents.length === 0) {
      this.showErrorNoStudents = true;
      this.pageLoaded = true;
      return;
    }
    this.selectedStudent = this.registeredStudents[0];
    this.lockDays = getLockDays(dateMonday.toString(), this.allVacations,this.vacationsStudent, this.customer.generalSettings.state,this.selectedStudent.subgroup);
    if (!this.querySelection) return;
    // if(this.checkForErrors(this.selectedStudent)){
    //   return
    // }
    if (this.displayOrderTypeWeek) {
      this.getOrdersWeekStudent(this.selectedStudent, this.querySelection, this.selectedWeekplan)
    } else {
      this.changeDateDay(normalizeToBerlinDate(new Date()))
    }
  }

  getDataWeek() {
    this.pageLoaded = false;
    const dateMonday = getDateMondayFromCalenderweek(this.querySelection);
    forkJoin([
      this.accountService.getAccountTenant(),
      this.generellService.getWeekplanWeek(this.querySelection),
    ]).subscribe(([accountTenant, weekplan]: [AccountCustomerInterface, WeekplanMenuInterface]) => {
      this.accountTenant = accountTenant;

      ///Sets the Weekplan from Catering Company with Menus and Allergenes
      this.selectedWeekplan = getMenusForWeekplan(weekplan, this.menus, this.settings, this.querySelection);
      ///Sets the Lockdays Array, Vacation Customer or State Holiday
      this.lockDays = getLockDays(dateMonday.toString(), this.allVacations,this.vacationsStudent, this.customer.generalSettings.state,this.selectedStudent?.subgroup || '');
      if (!this.selectedStudent) return;
      this.getOrdersWeekStudent(this.selectedStudent, this.querySelection, this.selectedWeekplan)
    })
  }


  getOrdersWeekStudent(selectedStudent: StudentInterface, queryDate: QueryInterOrderInterface, weekplanSelectedWeek: WeekplanMenuInterface) {
    this.orderWeek = [];
    this.vacationsStudent = [];

    if (!selectedStudent?._id) {
      this.pageLoaded = true;
      return;
    }
    let studentId = selectedStudent._id;
    const dateMonday = normalizeToBerlinDate(
      getDateMondayFromCalenderweek(this.querySelection)
    );

    if (!this.selectedStudent) {
      this.pageLoaded = true;
      return;
    }

    // Zuerst die Urlaubsdaten des Studenten laden
    this.vacationService.getAllVacationStudentByStudentId(studentId).subscribe((vacations:VacationStudent[]) => {
        // Urlaubsdaten speichern
        this.vacationsStudent = vacations;
        this.lockDays = getLockDays(dateMonday.toString(), this.allVacations,this.vacationsStudent, this.customer.generalSettings.state,this.selectedStudent?.subgroup || '');
        // Dann mit dem Abrufen der Bestellungen fortfahren
        // Hole die 5 Werktage
        const workdays = getNextFiveWorkdays(dateMonday);

        // Erstelle die Promises für jeden Werktag
        const promiseOrderWeek = workdays.map(date =>
          this.orderService.getOrderStudentDay({
            dateOrder: date,
            studentId: studentId || ''
          })
        );

        // Timer für 400ms Verzögerung
        const timer$ = timer(400);

        // Combine the forkJoin observable with the timer observable
        combineLatest([
          forkJoin(promiseOrderWeek).pipe(defaultIfEmpty([null])),
          timer$
        ]).pipe(
          map(([orders]) => orders) // Extrahiere die Bestellungen
        ).subscribe((orders: (OrderInterfaceStudentSave | null)[]) => {
          this.ngZone.run(() => {
            workdays.forEach((date, index) => {
              if (!this.selectedStudent) return;

              this.orderWeek.push(
                setOrderDayStudent(
                  orders[index],
                  weekplanSelectedWeek,
                  this.settings,
                  this.customer,
                  this.selectedStudent,
                  index,
                  new Date(date), // String-Datum im YYYY-MM-DD Format
                  this.querySelection,
                  this.lockDays,
                  this.schoolSettings,

                )
              );
            });
            this.pageLoaded = true;
          });
        });
      },
      (error) => {
        console.error('Fehler beim Laden der Urlaubsdaten:', error);
        this.pageLoaded = true;
      }
    );
  }

  
}

