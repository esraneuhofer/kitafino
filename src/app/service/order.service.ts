import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs";
import {OrderInterfaceStudentSave} from "../classes/order_student_safe.class";
import {OrderInterfaceStudent} from "../classes/order_student.class";
import {OrdersAccountInterface} from "../classes/order_account.interface";


@Injectable(
  {providedIn: 'root'}
)

export class OrderService {

  noAuthHeader = {headers: new HttpHeaders({'NoAuth': 'True'})};

  constructor(private http: HttpClient) {

  }

  getOrderStudentDay(query: { dateOrder: string, studentId: string }) {
    return this.http.get<OrderInterfaceStudentSave>(environment.apiBaseUrl + '/getOrderStudentDay', {params: query})
      .pipe(map((response: OrderInterfaceStudentSave) => (response)));
  }
  getOrderStudentYear(query: { year:number }) {
    return this.http.get<OrderInterfaceStudentSave[]>(environment.apiBaseUrl + '/getOrderStudentYear', {params: query})
      .pipe(map((response: OrderInterfaceStudentSave[]) => (response)));
  }
  getAccountOrderUserYear(query: { year:number }) {
    return this.http.get<OrdersAccountInterface[]>(environment.apiBaseUrl + '/getAccountOrderUserYear', {params: query})
      .pipe(map((response: OrdersAccountInterface[]) => (response)));
  }

  addOrderStudentDay(object: OrderInterfaceStudentSave) {
    return this.http.post(environment.apiBaseUrl + '/addOrderStudentDay', object)
      .pipe(map((response: any) => response));
  }
  cancelOrderStudent(object: OrderInterfaceStudent | OrderInterfaceStudentSave) {
    return this.http.post(environment.apiBaseUrl + '/cancelOrderStudent', object)
      .pipe(map((response: any) => response));
  }
  editStudentOrder(object: OrderInterfaceStudentSave) {
    return this.http.post(environment.apiBaseUrl + '/editStudentOrder', object)
      .pipe(map((response: any) => response));
  }

  // getWeekplanWeek(query:{week:number, year:number}) {
  //   return this.http.get<WeekplanMenuInterface>(environment.apiBaseUrl + '/getWeekplanWeek', {params: query})
  //     .pipe(map((response: WeekplanMenuInterface) => (response)));
  // }

}
