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
import {OrderModelInterfaceNew} from "../../classes/order.class";

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


  indexDaySelected:number = 0;

  subGroupsCustomer: string[] = []; //Subgroup

  orderModel!:OrderModelInterfaceNew;
  customer!:CustomerInterface;
  weekplan!:WeekplanMenuInterface;
  meals!:MealModelInterface[];
  menus!:MenuInterface[];
  articleDeclarations!:ArticleDeclarations[];
  articles!:ArticleInterface[];
  settings!:SettingInterfaceNew;

  constructor(private generellService:GenerellService) {
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
    ]).subscribe(
      ([
         settings,
         customer,
         weekplan, // Assuming this is of type WeekplanMenuInterface
         meals,
         menus,
         articleDeclarations,
         articles,
       ]: [
        SettingInterfaceNew,
        CustomerInterface,
        WeekplanMenuInterface, // Adjust the type here
        MealModelInterface[],
        MenuInterface[],
        ArticleDeclarations,
        ArticleInterface[],
      ]) => {
        this.settings = settings;
        this.customer = customer;
        this.weekplan = weekplan;
        this.allMeals = getMealsWithArticle(meals, articles, articleDeclarations);
        this.allMenus = getMenusWithMealsAndArticle(data[4], this.allMeals);
        this.meals = meals;
        this.menus = menus;
        this.articleDeclarations = articleDeclarations;
        this.articles = articles;
        this.checkDeadline(new Date().toISOString());
        this.subGroupsCustomer = getSplit(this.customer); //Gets customer splits
        console.log(this.subGroupsCustomer);
        this.pageLoaded = true;
      },
      (error) => {
        console.error('An error occurred:', error);
        // Handle errors as needed.
      }
    );
  }



  checkDeadline(day:string):void {
    console.log(day);
    console.log(typeof day);
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

  getOrderDay(day:string) {
    this.checkDeadline(day)
  }
}
