import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs";
import {OrderInterfaceStudentSave} from "../classes/order_student_safe.class";
import {OrderInterfaceStudent} from "../classes/order_student.class";
import {OrdersAccountInterface} from "../classes/order_account.interface";
import {PermanentOrderInterface} from "../classes/permanent-order.interface";


@Injectable(
  {providedIn: 'root'}
)

export class PermanentOrderService {

  noAuthHeader = {headers: new HttpHeaders({'NoAuth': 'True'})};

  constructor(private http: HttpClient) {

  }


  getPermanentOrdersUser() {
    return this.http.get<PermanentOrderInterface[]>(environment.apiBaseUrl + '/getPermanentOrdersUser')
      .pipe(map((response: PermanentOrderInterface[]) => (response)));
  }

  deletePermanentOrdersUser(object: PermanentOrderInterface) {
    return this.http.post(environment.apiBaseUrl + '/deletePermanentOrdersUser', object)
      .pipe(map((response: any) => response));
  }
  setPermanentOrdersUser(object: PermanentOrderInterface) {
    return this.http.post(environment.apiBaseUrl + '/setPermanentOrdersUser', object)
      .pipe(map((response: any) => response));
  }
  editPermanentOrdersUser(object: PermanentOrderInterface) {
    return this.http.post(environment.apiBaseUrl + '/editPermanentOrdersUser', object)
      .pipe(map((response: any) => response));
  }

}
