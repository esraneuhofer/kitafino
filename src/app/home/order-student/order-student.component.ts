import {Component, HostListener, OnInit} from '@angular/core';
import {addDayFromDate, getDisplayOrderType, getSplit, getWeekNumber} from "./order.functions";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {GenerellService} from "../../service/generell.service";
import {defaultIfEmpty, forkJoin} from "rxjs";
import {CustomerInterface} from "../../classes/customer.class";
import {WeekplanMenuInterface} from "../../classes/weekplan.interface";
import {MealModelInterface} from "../../classes/meal.interface";
import {MenuInterface} from "../../classes/menu.interface";
import {ArticleDeclarations} from "../../classes/allergenes.interface";
import {ArticleInterface} from "../../classes/article.interface";
import {getMealsWithArticle, getMenusWithMealsAndArticle} from "../../functions/meal.functions";
import {VacationsInterface} from "../../classes/vacation.interface";
import {StudentInterface} from "../../classes/student.class";
import {StudentService} from "../../service/student.service";
import {ToastrService} from "ngx-toastr";
import {getMenusForWeekplan, QueryInterOrderInterface} from "../../functions/weekplan.functions";
import {TenantServiceStudent} from "../../service/tenant.service";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {
  AssignedWeekplanInterface,
  setWeekplanModelGroups,
  WeekplanGroupClass
} from "../../classes/assignedWeekplan.class";
import {AccountService} from "../../service/account.serive";
import {AccountCustomerInterface} from "../../classes/account.class";
import {formatDateToISO, getDateMondayFromCalenderweek} from "../../functions/order.functions";
import {checkDayWeekend, getCustomDayIndex, getLockDays} from "../../functions/date.functions";
import * as moment from "moment-timezone";
import {OrderInterfaceStudentSave} from "../../classes/order_student_safe.class";
import {isWidthToSmall, MealCardInterface, setOrderDayStudent} from "./order-container/order-container.component";
import {OrderService} from "../../service/order.service";
import {ActivatedRoute, Router} from "@angular/router";

const textBanner = "Um eine Bestellung einzutrgen muss zuerst ein Verpflegungsteilnehmer/in angemeldet werden"

@Component({
  selector: 'app-order-student',
  templateUrl: './order-student.component.html',
  styleUrls: ['./order-student.component.scss']
})
export class OrderStudentComponent implements OnInit {

  displayOrderType: string = 'week';
  indexDay:number = 0;
  initStudent: boolean = false;
  mainDataLoaded: boolean = false;
  textBanner = textBanner;
  pageLoaded: boolean = false;
  studentNoSubgroup: boolean = false;
  lockDays: boolean[] = [];
  displayMinimize: boolean = false;

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
  allVacations: VacationsInterface[] = [];
  selectedStudent: (StudentInterface | null) = null;
  tenantStudent!: TenantStudentInterface;
  assignedWeekplanSelected!: AssignedWeekplanInterface;
  weekplanGroups: WeekplanGroupClass[] = [];
  accountTenant!: AccountCustomerInterface;
  weekplanSelectedWeek: (WeekplanMenuInterface | null) = null;
  orderWeek: MealCardInterface[] = [];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.displayMinimize = isWidthToSmall(event.target.innerWidth);
    console.log(this.displayMinimize)

  }

  goToChargeMoney() {
    this.router.navigate(['../home/account_overview'], {relativeTo: this.r.parent});
  }

  constructor(private generellService: GenerellService,
              private toastr: ToastrService,
              private tenantService: TenantServiceStudent,
              private studentService: StudentService,
              private accountService: AccountService,
              private orderService: OrderService,
              private router: Router,
              private r: ActivatedRoute) {
  }

  ngOnInit() {
    this.displayMinimize = isWidthToSmall(window.innerWidth);
    if(this.displayMinimize){
      this.displayOrderType = 'day';
    }
    this.querySelection = {year: new Date().getFullYear(), week: getWeekNumber(new Date())};
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
      this.generellService.getVacationCustomer()
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
         vacations
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
        VacationsInterface[]
      ]) => {
        this.settings = settings;
        this.customer = customer;
        this.customer.stateHol = 'HE' //Testing
        this.meals = getMealsWithArticle(meals, articles, articleDeclarations);
        this.menus = getMenusWithMealsAndArticle(menus, this.meals);
        this.registeredStudents = students;
        this.articleDeclarations = articleDeclarations;
        this.articles = articles;
        this.subGroupsCustomer = getSplit(this.customer); //Gets customer splits
        this.selectedWeekplan = getMenusForWeekplan(weekplan, menus, this.settings, this.querySelection);
        this.assignedWeekplanSelected = setWeekplanModelGroups(this.selectedWeekplan, this.querySelection, assignedWeekplans, customer, this.weekplanGroups, settings);
        this.tenantStudent = tenantStudent;
        this.accountTenant = accountTenant;
        this.displayOrderType = getDisplayOrderType(tenantStudent,this.displayOrderType)
        this.allVacations = vacations;
        this.mainDataLoaded = true;
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
  changeDateDay(queryDate: any): void {

    this.orderWeek = [];
    this.pageLoaded = false;
    const dateMonday = getDateMondayFromCalenderweek(this.querySelection);
    let dateToSearch = moment.tz(formatDateToISO(queryDate), 'Europe/Berlin').format()
    if(!this.selectedStudent || !this.selectedStudent._id ){
      this.pageLoaded = true;
      return;
    }
    if(checkDayWeekend(dateToSearch)){
      this.toastr.warning('Am Wochenende kann keine Bestellung aufgegeben werden')
      this.pageLoaded = true;
      return;
    }
    this.indexDay = getCustomDayIndex(new Date(queryDate));
      forkJoin([
      this.accountService.getAccountTenant(),
      this.generellService.getWeekplanWeek(this.querySelection),
      this.orderService.getOrderStudentDay({dateOrder: dateToSearch, studentId: this.selectedStudent._id})
    ]).subscribe(([accountTenant, weekplan,orderStudent]: [AccountCustomerInterface, WeekplanMenuInterface,(OrderInterfaceStudentSave | null)]) => {
      this.accountTenant = accountTenant;
      ///Sets the Weekplan from Catering Company with Menus and Allergenes
      this.selectedWeekplan = getMenusForWeekplan(weekplan, this.menus, this.settings, this.querySelection);
      ///Sets the Lockdays Array, Vacation Customer or State Holiday
      this.lockDays = getLockDays(dateMonday.toString(), this.allVacations, this.customer.stateHol);

      if (!this.selectedStudent) return;
      this.orderWeek.push(setOrderDayStudent(orderStudent, this.selectedWeekplan, this.settings, this.customer, this.selectedStudent, this.indexDay, new Date(dateToSearch), this.querySelection, this.lockDays))
        this.pageLoaded = true
    })
  }

  getOrderDay(queryDate: QueryInterOrderInterface, selectedStudent: StudentInterface | null): void {
    if (!this.selectedStudent) {
      this.toastr.warning('Bitte wählen Sie einen Verpflegungsteilnehmer aus');
      this.pageLoaded = true;
      // this.fetchingOrder = false;
      return
    }
    if (!selectedStudent || !this.selectedWeekplan) return;
    this.getOrdersWeekStudent(this.selectedStudent, queryDate, this.selectedWeekplan)
  }

  selectStudent(student: StudentInterface | null) {
    if(!this.initStudent){
      this.initStudent = true;
      return;
    }
    this.checkForErrors(student, this.querySelection);
    this.getOrderDay(this.querySelection, this.selectedStudent)
  }

  checkForErrors(selectedStudent:StudentInterface | null,query:QueryInterOrderInterface):boolean{
    if(!query)return true;
    this.studentNoSubgroup = false;
    if (!selectedStudent) {
      this.toastr.warning('Bitte wählen Sie einen Verpflegungsteilnehmer aus');
      this.pageLoaded = true;
      return true
    }
    if (!selectedStudent.subgroup) {
      this.studentNoSubgroup = true;
      this.pageLoaded = false;
      this.toastr.warning('Dem Verpflegungsteilnehmer ist keine Gruppe zugeordnet');
      return true
    }
    return false;
  }
  setFirstInit(weekplanSelectedWeek: WeekplanMenuInterface){
    const dateMonday = getDateMondayFromCalenderweek(this.querySelection);
    this.selectedWeekplan = getMenusForWeekplan(weekplanSelectedWeek, this.menus, this.settings, this.querySelection);
    this.lockDays = getLockDays(dateMonday.toString(), this.allVacations, this.customer.stateHol);
    this.selectedStudent = this.registeredStudents[0];
    if(this.checkForErrors(this.selectedStudent,this.querySelection))return;
    if(this.displayOrderType === 'week'){
      this.getOrdersWeekStudent(this.selectedStudent, this.querySelection, this.selectedWeekplan)
    }else{
      this.changeDateDay(new Date())
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
      this.lockDays = getLockDays(dateMonday.toString(), this.allVacations, this.customer.stateHol);
      if (!this.selectedStudent) return;
      this.getOrdersWeekStudent(this.selectedStudent, this.querySelection, this.selectedWeekplan)
    })
  }

  getOrdersWeekStudent(selectedStudent: StudentInterface, queryDate: QueryInterOrderInterface, weekplanSelectedWeek: WeekplanMenuInterface) {
    this.orderWeek = [];
    const dateMonday = getDateMondayFromCalenderweek(this.querySelection);
    let promiseOrderWeek = [];
    for (let i = 0; i < 5; i++) {
      let dateToSearch = moment.tz(addDayFromDate(dateMonday, i), 'Europe/Berlin').format()
      console.log(dateToSearch)
      if (!this.selectedStudent) return;
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
        if (!this.selectedStudent) return;
        this.orderWeek.push(setOrderDayStudent(order[i], weekplanSelectedWeek, this.settings, this.customer, this.selectedStudent, i, date, this.querySelection, this.lockDays))
      }
      this.pageLoaded = true;

    })
  }

}
