import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map, Observable} from "rxjs";
import {CustomerInterface} from "../classes/customer.class";
import {PasswordNewInterface} from "../home/settings/settings.component";


@Injectable(
  {providedIn: 'root'}
)

export class UserService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  resetPassword(obj:{username:string}) {
    return this.http.post(environment.apiBaseUrl + '/resetPassword', obj)
      .pipe(map((response: any) => response));
  }

  changePassword(obj:PasswordNewInterface) {
    return this.http.post(environment.apiBaseUrl + '/changePassword', obj)
      .pipe(map((response: any) => response));
  }
  deactivateAccount() {
    return this.http.post(environment.apiBaseUrl + '/deactivateAccount',{})
      .pipe(map((response: any) => response));
  }

  addUser(user:{email:string,projectId:string}) {
    return this.http.post(environment.apiBaseUrl + '/register', user,{ withCredentials: true })
      .pipe(map((response: any) => response));
  }


  login(authCredentials:{email:string,password:string}) {
    return this.http.post(environment.apiBaseUrl+ '/authenticate', authCredentials,this.noAuthHeader);
  }

  addTaskOrderDeadlineCustomer(customer:CustomerInterface) {
    return this.http.post(environment.apiBaseUrl + '/addTaskOrderDeadlineCustomer', customer)
      .pipe(map((response: any) => response));
  }

  userProfile() {

    return this.http.get<{username:string,email:string}>(environment.apiBaseUrl+'/userProfile')
      .pipe(map((response: {username:string,email:string}) => (response)));
  }

  //Helper Methods

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  deleteToken() {
    localStorage.removeItem('token');
  }

  getUserPayload() {
    var token = this.getToken();
    if (token) {
      var userPayload = atob(token.split('.')[1]);
      return JSON.parse(userPayload);
    }
    else
      return null;
  }

  isLoggedIn() {
    var userPayload = this.getUserPayload();
    if (userPayload)
      return userPayload.exp > Date.now() / 1000;
    else
      return false;
  }

}
