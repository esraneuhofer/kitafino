import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {StudentInterface} from "../classes/student.class";
import {SettingInterfaceNew} from "../classes/setting.class";


@Injectable(
  {providedIn: 'root'}
)

export class GenerellService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  getSettingsTenant(){
    return this.http.get<SettingInterfaceNew>(environment.apiBaseUrl+'/getSettingsTenant')
      .pipe(map((response: SettingInterfaceNew) => (response)));
  }

  addStudent(object:StudentInterface){
    return this.http.post(environment.apiBaseUrl+'/addStudent',object)
      .pipe(map((response: any) => response));
  }



}
