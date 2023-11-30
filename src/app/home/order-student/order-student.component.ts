import {Component, OnInit} from '@angular/core';
import {getSplit, getWeekNumber, timeDifference} from "./order.functions";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {GenerellService} from "../../service/generell.service";
import {forkJoin} from "rxjs";
import {CustomerInterface, CustomerOrderSplit} from "../../classes/customer.class";
import {WeekplanDayInterface, WeekplanMenuInterface} from "../../classes/weekplan.interface";
import {MealModelInterface} from "../../classes/meal.interface";
import {MenuInterface} from "../../classes/menu.interface";
import {Allergene, ArticleDeclarations} from "../../classes/allergenes.interface";
import {ArticleInterface} from "../../classes/article.interface";
import {OrderModelInterfaceNew, OrderStudentInterface} from "../../classes/order.class";
import {getMealsWithArticle, getMenusWithMealsAndArticle} from "../../functions/meal.functions";
import {OrderService} from "../../service/order.service";
import {getMenusForWeekplan} from "../../functions/weekplan.functions";
import {getLockDays} from "../../functions/date.functions";
import {VacationsInterface} from "../../classes/vacation.interface";
import {StudentInterface} from "../../classes/student.class";
import {StudentService} from "../../service/student.service";
import {OrderClassStudent, OrderInterfaceStudent} from "../../classes/order_student.class";

export interface QueryInterOrderInterface {
  week: number,
  year: number
}

@Component({
  selector: 'app-order-student',
  templateUrl: './order-student.component.html',
  styleUrls: ['./order-student.component.scss']
})
export class OrderStudentComponent implements OnInit{

  pageLoaded:boolean = false;
  differenceTimeDeadline:string = '';
  pastOrder:boolean = false;
  timerInterval:any;
  dateChange: string = new Date().toISOString().split('T')[0];
  lockDays:boolean[] = [];

  registeredStudents:StudentInterface[] = [];

  selected: Date | null = new Date();

  indexDaySelected:number = 0;

  subGroupsCustomer: string[] = []; //Subgroup

  orderModel!:OrderModelInterfaceNew;
  customer!:CustomerInterface;
  weekplan!:WeekplanMenuInterface;
  meals!:MealModelInterface[];
  menus!:MenuInterface[];
  articleDeclarations!:ArticleDeclarations;
  articles!:ArticleInterface[];
  settings!:SettingInterfaceNew;
  allVacations:VacationsInterface[] = [];
  orderModelStudent!:OrderInterfaceStudent;
  selectedStudent:(StudentInterface | null) = null;

  weekplanSelectedWeek!: WeekplanMenuInterface;

  constructor(private generellService:GenerellService, private orderService:OrderService, private studentService:StudentService) {
  }

  ngOnInit() {
    forkJoin([
      this.generellService.getSettingsTenant(),
      this.generellService.getCustomerInfo(),
      this.generellService.getWeekplanWeek({ year: new Date().getFullYear(), week: getWeekNumber(new Date()) }),
      this.generellService.getMeals(),
      this.generellService.getMenus(),
      this.generellService.getArticleDeclaration(),
      this.generellService.getArticle(),
      this.studentService.getRegisteredStudentsUser(),
    ]).subscribe(
      ([
         settings,
         customer,
         weekplan, // Assuming this is of type WeekplanMenuInterface
         meals,
         menus,
         articleDeclarations,
         articles,
        students
       ]: [
        SettingInterfaceNew,
        CustomerInterface,
        WeekplanMenuInterface, // Adjust the type here
        MealModelInterface[],
        MenuInterface[],
        ArticleDeclarations,
        ArticleInterface[],
        StudentInterface[]
      ]) => {
        this.settings = settings;
        this.customer = customer;
        this.weekplan = weekplan;
        console.log(
          customer);
        this.meals = getMealsWithArticle(meals, articles, articleDeclarations);
        this.menus = getMenusWithMealsAndArticle(menus, this.meals);
        this.registeredStudents = students;
        this.articleDeclarations = articleDeclarations;
        this.articles = articles;
        this.checkDeadline(new Date().toISOString());
        this.subGroupsCustomer = getSplit(this.customer); //Gets customer splits
        if(this.registeredStudents.length === 1){
          this.selectedStudent = this.registeredStudents[0];
        }
        this.getOrderDay(this.dateChange,this.selectedStudent);
      },
      (error) => {
        console.error('An error occurred:', error);
        // Handle errors as needed.
      }
    );
  }

  selectedMenuDay():void{

  }



  checkDeadline(day:string):void {

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

  getOrderDay(day:string,selectedStudent:(StudentInterface | null)) {
    this.checkDeadline(day)
    this.dateChange = new Date(day).toISOString().split('T')[0];
    let query = {year: new Date(day).getFullYear(), week: getWeekNumber(new Date(day))}
    console.log(query)
    forkJoin(
      this.orderService.getOrderStudentWeek(query),
      this.generellService.getWeekplanWeek(query),
      // this.generellService.getAssignedWeekplan({week: year, year: calenderWeek}),
    ).subscribe(([order,weekplan]:[OrderStudentInterface,WeekplanMenuInterface]) => {

      ///Sets the Weekplan from Catering Company with Menus and Allergenes
      this.weekplanSelectedWeek = getMenusForWeekplan(weekplan, this.menus, this.settings,query);

      ///Sets the Lockdays Array, Vacation Customer or State Holiday
      this.customer.stateHol = 'HE' //Testing
      this.lockDays = getLockDays(day, this.allVacations, this.customer.stateHol);
      this.orderModelStudent = new OrderClassStudent(this.customer,query,this.settings,this.weekplanSelectedWeek.weekplan[this.indexDaySelected],selectedStudent);
      // this.assignedWeekplanSelected = setWeekplanModelGroups(this.weekplanSelectedWeek, {
      //   year: year,
      //   week: calenderWeek
      // }, data[1], this.customerInfo, this.weekplanGroups,this.settings);
      // this.orderModel = null;
      // let indexDay = new Date(event).getDay();
      //
      // if (indexDay === 6 || indexDay === 0) {
      //   this.pageLoaded = true;
      //   this.getOrderSubmitting = false;
      //   this.orderModel = null;
      //   return this.toastr.warning('Bitte wählen Sie einen Tag zwischen Montag und Freitag');
      // }
      // this.orderModel = data[2];
      // if (this.settings.orderSettings.sideOrDessertChoose) {
      //   this.sideDessertSelection = getSideDessertSelection(this.orderModel.order, this.settings, this.customerInfo);
      // }
      // this.checkDeadline(event);
      // this.indexDaySelected = indexDay - 1;
      // this.selectedOrderCopy = JSON.parse(JSON.stringify(this.orderModel));
      // this.pageLoaded = true;
      // this.getOrderSubmitting = false;
      // this.submittingRequest = false;
      this.pageLoaded = true;

    });
  }
}
