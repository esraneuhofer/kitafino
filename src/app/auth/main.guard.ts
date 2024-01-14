import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {UserService} from "../service/user.service";
import {StudentService} from "../service/student.service";
import {catchError, Observable, of, tap} from "rxjs";
import {TenantServiceStudent} from "../service/tenant.service";

@Injectable(
  {providedIn: 'root'}
)

export class MainGuard {

  constructor(private tenantServiceStudent:TenantServiceStudent, private router:Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.tenantServiceStudent.hasRegisteredTenant().pipe(
      // tap(hasStudent => {
      //   if (!hasStudent) {
      //     this.router.navigateByUrl('/register_tenant');
      //   }
      // }),
      // catchError((error) => {
      //   console.error(error);
      //   this.router.navigateByUrl('/register_tenant');
      //   return of(false);
      // })
    );
  }
}
