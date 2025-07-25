import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { StudentInterface } from "../classes/student.class";
import { SettingInterfaceNew } from "../classes/setting.class";
import { CustomerInterface } from "../classes/customer.class";
import { ArticleInterface } from "../classes/article.interface";
import { MealModelInterface } from "../classes/meal.interface";
import { Allergene, ArticleDeclarations } from "../classes/allergenes.interface";
import { WeekplanMenuInterface } from "../classes/weekplan.interface";
import { MenuInterface } from "../classes/menu.interface";
import { AssignedWeekplanInterface, WeekplanGroupClass, WeekplanGroupSelection } from "../classes/assignedWeekplan.class";
import { WeekplanPdfInterface } from "../home/weekplan-pdf/weekplan-pdf.component";
import { VacationsSubgroupInterface } from "../classes/vacation.interface";
import { PaymentIntentResponse } from "../home/account/account-payment-overview/account-payment-overview.component";
import { OrderHistoryTableInterface } from "../home/order-history/order-history.component";
import { EinrichtungInterface } from "../classes/einrichtung.class";
import { getInvoiceDateOne } from "../functions/date.functions";


class FeedbackInterface {
}

@Injectable(
  { providedIn: 'root' }
)

export class GenerellService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient) {

  }

  sendFeedback(feedback: FeedbackInterface) {
    return this.http.post(environment.apiBaseUrl + '/sendFeedback', feedback)
      .pipe(map((response: any) => response));
  }


  getSettingsCaterer() {
    return this.http.get<SettingInterfaceNew>(environment.apiBaseUrl + '/getSettingsCaterer')
      .pipe(map((response: SettingInterfaceNew) => (response)));
  }

  healthcheck() {
    return this.http.get<any>(environment.apiBaseUrl + '/healthcheck')
      .pipe(map((response: any) => (response)));
  }

  getCustomerInfo() {
    return this.http.get<CustomerInterface>(environment.apiBaseUrl + '/getCustomerInfo')
      .pipe(map((response: CustomerInterface) => (response)));
  }

  getSchoolSettings() {
    return this.http.get<EinrichtungInterface>(environment.apiBaseUrl + '/getSchoolSettings')
      .pipe(map((response: EinrichtungInterface) => (response)));
  }


  getWeekplanWeek(query: { week: number, year: number }) {
    return this.http.get<WeekplanMenuInterface>(environment.apiBaseUrl + '/getWeekplanWeek', { params: query })
      .pipe(map((response: WeekplanMenuInterface) => (response)));
  }
  getSingelWeekplanPdf(query: { _id: string }) {
    return this.http.get<WeekplanPdfInterface>(environment.apiBaseUrl + '/getSingelWeekplanPdf', { params: query })
      .pipe(map((response: WeekplanPdfInterface) => (response)));
  }
  getAllWeekplanPdf(query: { year: number }) {
    return this.http.get<WeekplanPdfInterface[]>(environment.apiBaseUrl + '/getAllWeekplanPdf', { params: query })
      .pipe(map((response: WeekplanPdfInterface[]) => (response)));
  }
  getWeekplanPdfWeek(query: { year: number, week: number }) {
    return this.http.get<WeekplanPdfInterface[]>(environment.apiBaseUrl + '/getWeekplanPdfWeek', { params: query })
      .pipe(map((response: WeekplanPdfInterface[]) => (response)));
  }


  getWeekplanGroups() {
    return this.http.get<WeekplanGroupClass[]>(environment.apiBaseUrl + '/getWeekplanGroups')
      .pipe(map((response: WeekplanGroupClass[]) => (response)));
  }

  getWeekplanGroupSelection() {
    return this.http.get<WeekplanGroupSelection>(environment.apiBaseUrl + '/getWeekplanGroupSelection')
      .pipe(map((response: WeekplanGroupSelection) => (response)));
  }


  getVacationCustomer() {
    return this.http.get<VacationsSubgroupInterface[]>(environment.apiBaseUrl + '/getVacationCustomer')
      .pipe(map((response: VacationsSubgroupInterface[]) => (response)));
  }

  getAssignedWeekplan(query: { week: number, year: number }) {
    return this.http.get<AssignedWeekplanInterface[]>(environment.apiBaseUrl + '/getAssignedWeekplan', { params: query })
      .pipe(map((response: AssignedWeekplanInterface[]) => (response)));
  }
  getMeals() {
    return this.http.get<MealModelInterface[]>(environment.apiBaseUrl + '/getMeals')
      .pipe(map((response: MealModelInterface[]) => (response)));
  }
  getMenus() {
    return this.http.get<MenuInterface[]>(environment.apiBaseUrl + '/getMenus')
      .pipe(map((response: MenuInterface[]) => (response)));
  }
  getArticleDeclaration() {
    return this.http.get<ArticleDeclarations>(environment.apiBaseUrl + '/getArticleDeclaration')
      .pipe(map((response: ArticleDeclarations) => (response)));
  }
  getArticle() {
    return this.http.get<ArticleInterface[]>(environment.apiBaseUrl + '/getArticle')
      .pipe(map((response: ArticleInterface[]) => (response)));
  }

  sendEmail(object: any) {
    return this.http.post(environment.apiBaseUrl + '/sendEmail', object)
      .pipe(map((response: any) => response));
  }
  sendCSVEmail(object: {
    file: Blob,
    firstDate: string,
    secondDate: string,
    type: string,
    email: string
  }): Observable<any> {
    const formData = new FormData();
    formData.append('file', object.file, `Bestellhistorie_${object.firstDate}_to_${object.secondDate}.xls`);
    formData.append('firstDate', object.firstDate);
    formData.append('secondDate', object.secondDate);
    formData.append('type', object.type);
    formData.append('email', object.email);

    return this.http.post(environment.apiBaseUrl + '/sendCSVEmail', formData)
      .pipe(map((response: any) => response));
  }

  sendPDFEmail(object: {
    file: Blob,
    firstDate: string,
    secondDate: string,
    type: string,
    email: string
  }): Observable<any> {
    const formData = new FormData();
    formData.append('file', object.file, `Bestellverlauf${getInvoiceDateOne(object.firstDate)}_to_${getInvoiceDateOne(object.secondDate)}.pdf`);
    formData.append('firstDate', getInvoiceDateOne(object.firstDate));
    formData.append('secondDate', getInvoiceDateOne(object.secondDate));
    formData.append('type', object.type);
    formData.append('email', object.email);

    return this.http.post(environment.apiBaseUrl + '/sendPDFEmail', formData)
      .pipe(map((response: any) => response));
  }

  createPaymentIntent(body: { amountPayment: number, userId: string, username: string, isAndroid: boolean, isIos: boolean }): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${environment.apiBaseUrl}/create-payment-intent`, body)
      .pipe(map(response => response));
  }
  setLanguage(body: { lang: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/setLanguage`, body, { withCredentials: true })
      .pipe(map(response => response));
  }



}
