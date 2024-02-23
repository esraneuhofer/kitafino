import {Component, OnInit} from '@angular/core';
import {getSplit, getWeekNumber, timeDifference} from "./order.functions";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {GenerellService} from "../../service/generell.service";
import {forkJoin} from "rxjs";
import {CustomerInterface} from "../../classes/customer.class";
import {getWeekplanModel, WeekplanMenuInterface} from "../../classes/weekplan.interface";
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
import {query} from "@angular/animations";
import {
  AssignedWeekplanInterface,
  setWeekplanModelGroups,
  WeekplanGroupClass
} from "../../classes/assignedWeekplan.class";
import {data} from "autoprefixer";
import {AccountService} from "../../service/account.serive";
import {AccountCustomerInterface} from "../../classes/account.class";
import {getSpecialFoodSelectionCustomer, SpecialFoodSelectionStudent} from "../../functions/special-food.functions";

const textBanner = "Um eine Bestellung für den Verpflegungsteilnehmer/in einzutragen muss er/sie zuerst angemeldet werden"
@Component({
  selector: 'app-order-student',
  templateUrl: './order-student.component.html',
  styleUrls: ['./order-student.component.scss']
})
export class OrderStudentComponent implements OnInit {

  mainDataLoaded: boolean = false;
  textBanner = textBanner;
  pageLoaded: boolean = false;
  differenceTimeDeadline: string = '';
  pastOrder: boolean = false;
  timerInterval: any;
  validDay: boolean = false;
  fetchingOrder: boolean = false;
  studentNoSubgroup: boolean = false;

  showErrorNoStudents: boolean = false; // Show if no Students is registered yet
  registeredStudents: StudentInterface[] = [];
  indexDaySelected: number = 0;
  subGroupsCustomer: string[] = []; //Subgroup
  querySelection?:QueryInterOrderInterface
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
  accountTenant!:AccountCustomerInterface;

  constructor(private generellService: GenerellService,
              private toastr: ToastrService,
              private tenantService: TenantServiceStudent,
              private studentService: StudentService,
              private accountService:AccountService) {
  }

  orderPlaced() {
    this.accountService.getAccountTenant().subscribe((accountTenant:AccountCustomerInterface) => {
      this.accountTenant = accountTenant;
    })
  }
  ngOnInit() {
    const queryInit = {year: new Date().getFullYear(), week: getWeekNumber(new Date())};
    forkJoin([
      this.generellService.getSettingsCaterer(),
      this.generellService.getCustomerInfo(),
      this.generellService.getWeekplanWeek(queryInit),
      this.generellService.getMeals(),
      this.generellService.getMenus(),
      this.generellService.getArticleDeclaration(),
      this.generellService.getArticle(),
      this.studentService.getRegisteredStudentsUser(),
      this.tenantService.getTenantInformation(),
      this.generellService.getAssignedWeekplan(queryInit),
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
        this.checkDeadline(new Date());
        this.subGroupsCustomer = getSplit(this.customer); //Gets customer splits
        this.selectedWeekplan = getMenusForWeekplan(weekplan, menus, this.settings,queryInit);
        this.assignedWeekplanSelected = setWeekplanModelGroups(this.selectedWeekplan, queryInit, assignedWeekplans, customer,this.weekplanGroups,settings);
        this.tenantStudent = tenantStudent;
        this.accountTenant = accountTenant;
        this.allVacations = vacations;
        this.mainDataLoaded = true;

      },
      (error) => {
        console.error('An error occurred:', error);
        // Handle errors as needed.
      }
    );
  }

  changeDate(queryDate: QueryInterOrderInterface):void{
    this.querySelection = {...queryDate};
    this.getOrderDay(queryDate,this.selectedStudent)
  }
  getOrderDay(queryDate: QueryInterOrderInterface,selectedStudent:StudentInterface | null): void {
    this.querySelection = {...queryDate};
    this.fetchingOrder = true;
    if (!this.selectedStudent) {
      this.toastr.warning('Bitte wählen Sie einen Verpflegungsteilnehmer aus');
    }
    if (!this.selectedStudent) {
      this.validDay = false;
      this.fetchingOrder = false;
      this.pageLoaded = true;
      return
    }
    this.validDay = true;
    this.fetchingOrder = false;
    this.pageLoaded = true;
  }
  selectStudent(student:StudentInterface | null){
    if(!student)return;
    this.studentNoSubgroup = false;
    this.selectedStudent = student;
    if(!student.subgroup){
      this.studentNoSubgroup = true;
      this.toastr.warning('Dem Verpflegungsteilnehmer ist keine Gruppe zugeordnet');
      return;
    }
    if(!this.querySelection)return;

    this.getOrderDay(this.querySelection,this.selectedStudent)
  }

  checkDeadline(day: Date): void {
    const distance = timeDifference(this.settings.orderSettings.deadLineDaily, day);
    if (!distance) {
      this.pastOrder = true;
      this.differenceTimeDeadline = 'Abbestellfrist ist abgelaufen!';
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

}
