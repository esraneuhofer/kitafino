import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, of} from "rxjs";
import {OrderInterfaceStudentSave} from "../classes/order_student_safe.class";
import {OrderInterfaceStudent} from "../classes/order_student.class";
import {OrdersAccountInterface} from "../classes/order_account.interface";
import {normalizeToBerlinDate} from "../functions/date.functions";


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
  getFutureOrders(query: { date: string }) {
    // Konvertiere das Datum in das richtige Format
    const formattedDate = normalizeToBerlinDate(query.date);

    return this.http.get<OrderInterfaceStudentSave[]>(
      `${environment.apiBaseUrl}/getFutureOrders`,
      { params: { startDate: formattedDate } }
    ).pipe(
      map(response => response),
      catchError(error => {
        console.error('Fehler beim Laden zukünftiger Bestellungen:', error);
        return of([]);
      })
    );
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

}
