import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { catchError, map, of } from "rxjs";
import { OrderInterfaceStudentSave } from "../classes/order_student_safe.class";
import { OrderInterfaceStudent } from "../classes/order_student.class";
import { OrdersAccountInterface } from "../classes/order_account.interface";
import { normalizeToBerlinDate } from "../functions/date.functions";


@Injectable(
  { providedIn: 'root' }
)

export class OrderService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient) {

  }

  getOrderStudentDay(query: { dateOrder: string, studentId: string }) {
    return this.http.get<OrderInterfaceStudentSave>(environment.apiBaseUrl + '/getOrderStudentDay', { params: query })
      .pipe(map((response: OrderInterfaceStudentSave) => (response)));
  }
  getFutureOrders() {
    // Backend bestimmt das aktuelle Datum selbst
    return this.http.get<OrderInterfaceStudentSave[]>(
      `${environment.apiBaseUrl}/getFutureOrders`
    ).pipe(
      map(response => response),
      catchError(error => {
        console.error('Fehler beim Laden zukünftiger Bestellungen:', error);
        return of([]);
      })
    );
  }

  getFutureOrdersStudent(query: { studentId: string }) {
    // Backend bestimmt das aktuelle Datum selbst
    return this.http.get<OrderInterfaceStudentSave[]>(
      `${environment.apiBaseUrl}/getFutureOrdersStudent`,
      { params: { studentId: query.studentId } }
    ).pipe(
      map(response => response),
      catchError(error => {
        console.error('Fehler beim Laden zukünftiger Bestellungen:', error);
        return of([]);
      })
    );
  }



  getAccountOrderUserYear(query: { year: number }) {
    return this.http.get<OrdersAccountInterface[]>(environment.apiBaseUrl + '/getAccountOrderUserYear', { params: query })
      .pipe(map((response: OrdersAccountInterface[]) => (response)));
  }

  getAllOrdersWithCancellations(query: { year: number }) {
    return this.http.get<OrderInterfaceStudentSave[]>(environment.apiBaseUrl + '/getAllOrdersWithCancellations', { params: query })
      .pipe(
        map((response: OrderInterfaceStudentSave[]) => (response)),
        catchError(error => {
          console.error('Error loading combined orders:', error);
          return of([]);
        })
      );
  }

  addOrderStudentDay(object: OrderInterfaceStudentSave) {
    return this.http.post(environment.apiBaseUrl + '/addOrderStudentDay', object)
      .pipe(map((response: any) => response));
  }
  cancelOrderStudent(object: OrderInterfaceStudent | OrderInterfaceStudentSave) {
    return this.http.post(environment.apiBaseUrl + '/cancelOrderStudent', object)
      .pipe(map((response: any) => response));
  }

}
