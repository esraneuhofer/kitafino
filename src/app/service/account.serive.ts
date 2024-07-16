import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {TenantStudentInterface} from "../classes/tenant.class";
import {AccountCustomerInterface} from "../classes/account.class";
import {Socket} from "ngx-socket-io";


@Injectable(
  {providedIn: 'root'}
)

export class AccountService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient,private socket: Socket) {

  }
  getAccountTenant(){
    return this.http.get<AccountCustomerInterface>(environment.apiBaseUrl+'/getAccountTenant')
      .pipe(map((response: AccountCustomerInterface) => (response)));
  }

  getBalanceUpdates(): Observable<any> {
    return this.socket.fromEvent('balanceUpdated');
  }
}
