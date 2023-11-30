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


@Injectable(
  {providedIn: 'root'}
)

export class GenerellService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  getSettingsTenant(){
    return this.http.get<SettingInterfaceNew>(environment.apiBaseUrl+'/getSettingsTenant')
      .pipe(map((response: SettingInterfaceNew) => (response)));
  }
  getCustomerInfo(){
    return this.http.get<CustomerInterface>(environment.apiBaseUrl+'/getCustomerInfo')
      .pipe(map((response: CustomerInterface) => (response)));
  }

  getWeekplanWeek(query:{week:number, year:number}){
    return this.http.get<WeekplanMenuInterface>(environment.apiBaseUrl+'/getWeekplanWeek',{params:query})
      .pipe(map((response: WeekplanMenuInterface) => (response)));
  }
  getAssignedWeekplan(query:{week:number, year:number}){
    return this.http.get<WeekplanMenuInterface>(environment.apiBaseUrl+'/getWeekplanWeek',{params:query})
      .pipe(map((response: WeekplanMenuInterface) => (response)));
  }
  getMeals(){
    return this.http.get<MealModelInterface[]>(environment.apiBaseUrl+'/getMeals')
      .pipe(map((response: MealModelInterface[]) => (response)));
  }
  getMenus(){
    return this.http.get<MenuInterface[]>(environment.apiBaseUrl+'/getMenus')
      .pipe(map((response: MenuInterface[]) => (response)));
  }
  getArticleDeclaration(){
    return this.http.get<ArticleDeclarations>(environment.apiBaseUrl+'/getArticleDeclaration')
      .pipe(map((response: ArticleDeclarations) => (response)));
  }
  getArticle(){
    return this.http.get<ArticleInterface[]>(environment.apiBaseUrl+'/getArticle')
      .pipe(map((response: ArticleInterface[]) => (response)));
  }

  addStudent(object:StudentInterface){
    return this.http.post(environment.apiBaseUrl+'/addStudent',object)
      .pipe(map((response: any) => response));
  }



}
