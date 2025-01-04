import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {AccountChargeInterface, ChargeAccountInterface} from "../classes/charge.class";
import {TenantStudentInterface} from "../classes/tenant.class";

@Injectable(
  {providedIn: 'root'}
)

export class ChargingService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }

  withdrawFunds(object:{accountCharge:ChargeAccountInterface,tenant:TenantStudentInterface}){
    return this.http.post(environment.apiBaseUrl+'/withdrawFunds',object)
      .pipe(map((response: any) => response));
  }

  getAccountCharges(){
    return this.http.get<AccountChargeInterface[]>(environment.apiBaseUrl+'/getAccountCharges')
      .pipe(map((response: AccountChargeInterface[]) => response));
  }
}
