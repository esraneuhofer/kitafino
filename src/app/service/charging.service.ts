import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {TenantStudentInterface} from "../classes/tenant.class";
import {AccountCustomerInterface} from "../classes/account.class";
import {StudentInterface} from "../classes/student.class";


@Injectable(
  {providedIn: 'root'}
)

export class ChargingService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  chargeAccountTenant(object:any){
    return this.http.post(environment.apiBaseUrl+'/chargeAccountTenant',object)
      .pipe(map((response: any) => response));
  }
  getAccountChargesDate(object:Date){
    return this.http.post(environment.apiBaseUrl+'/getAccountChargesDate',object)
      .pipe(map((response: any) => response));
  }
}
