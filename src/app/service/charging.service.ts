import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {AccountChargeInterface, ChargeAccountInterface} from "../classes/charge.class";

@Injectable(
  {providedIn: 'root'}
)

export class ChargingService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  addAccountChargesTenant(object:ChargeAccountInterface){
    return this.http.post(environment.apiBaseUrl+'/addAccountChargesTenant',object)
      .pipe(map((response: any) => response));
  }
  withdrawFunds(object:ChargeAccountInterface){
    return this.http.post(environment.apiBaseUrl+'/withdrawFunds',object)
      .pipe(map((response: any) => response));
  }

  getAccountCharges(){
    return this.http.get<AccountChargeInterface[]>(environment.apiBaseUrl+'/getAccountCharges')
      .pipe(map((response: AccountChargeInterface[]) => response));
  }
}
