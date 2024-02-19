import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {TenantStudentInterface} from "../classes/tenant.class";
import {AccountChargeInterface} from "../classes/charge.class";



@Injectable(
  {providedIn: 'root'}
)

export class TransactionService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  getTransactionTenant(){
    return this.http.get<AccountChargeInterface[]>(environment.apiBaseUrl+'/getTransactionTenant')
      .pipe(map((response: AccountChargeInterface[]) => (response)));
  }
}
