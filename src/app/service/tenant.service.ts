import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {BehaviorSubject, catchError, map, Observable, of} from "rxjs";
import {TenantStudentInterface} from "../classes/tenant.class";


@Injectable(
  {providedIn: 'root'}
)

export class TenantServiceStudent {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };
  private tenantSubject = new BehaviorSubject<TenantStudentInterface>({} as TenantStudentInterface);

  private tenantModel$ = this.tenantSubject.asObservable()
  constructor(private http:HttpClient) {

  }

  getTenantModel(): Observable<TenantStudentInterface> {
    return this.tenantSubject.asObservable();
  }
  getTenantInformation(){
    return this.http.get<TenantStudentInterface>(environment.apiBaseUrl+'/getTenantInformation')
      .pipe(map((response: TenantStudentInterface) => (response)));
  }
  hasRegisteredTenant(): Observable<boolean> {
    return this.getTenantInformation().pipe(
      map((tenant: TenantStudentInterface) => !!tenant && Object.keys(tenant).length > 0),
      catchError((error) => {
        return of(false); // If there's an error, you can assume no students are registered.
      })
    );
  }
  editParentTenant(object:TenantStudentInterface){
    return this.http.post(environment.apiBaseUrl+'/editParentTenant',object)
      .pipe(map((response: any) => response));
  }
  addParentTenant(object:TenantStudentInterface){
    return this.http.post(environment.apiBaseUrl+'/addParentTenant',object)
      .pipe(map((response: any) => response));
  }


}
