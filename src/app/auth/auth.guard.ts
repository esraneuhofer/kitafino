import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {UserService} from "../service/user.service";

@Injectable(
  {providedIn: 'root'}
)

export class AuthGuard {

  constructor(private userService:UserService, private router:Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    // if (!this.userService.isLoggedIn()) {
    //   this.router.navigateByUrl('/login');
    //   this.userService.deleteToken();
    //   return false;
    // }
    // console.log("Not logged in");

    return true;
  }
}
