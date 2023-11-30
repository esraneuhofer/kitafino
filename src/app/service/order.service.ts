import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {StudentInterface} from "../classes/student.class";
import {SettingInterfaceNew} from "../classes/setting.class";
import {CustomerInterface} from "../classes/customer.class";
import {ArticleInterface} from "../classes/article.interface";
import {MealModelInterface} from "../classes/meal.interface";
import {Allergene, ArticleDeclarations} from "../classes/allergenes.interface";
import {WeekplanMenuInterface} from "../classes/weekplan.interface";
import {MenuInterface} from "../classes/menu.interface";
import {OrderModelInterfaceNew, OrderStudentInterface} from "../classes/order.class";


@Injectable(
  {providedIn: 'root'}
)

export class OrderService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }

  getOrderStudentWeek(query:{week:number, year:number}){
    return this.http.get<OrderStudentInterface>(environment.apiBaseUrl+'/getOrderStudentWeek', {params: query})
      .pipe(map((response: OrderStudentInterface) => (response)));
  }

  // getWeekplanWeek(query:{week:number, year:number}) {
  //   return this.http.get<WeekplanMenuInterface>(environment.apiBaseUrl + '/getWeekplanWeek', {params: query})
  //     .pipe(map((response: WeekplanMenuInterface) => (response)));
  // }

}
