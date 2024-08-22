import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs";
import {SchoolSettingsInterface} from "../classes/schoolSettings.class";


@Injectable(
  {providedIn: 'root'}
)

export class SchoolService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  getSchoolSettings(){
    return this.http.get<SchoolSettingsInterface>(environment.apiBaseUrl+'/getSchoolSettings')
      .pipe(map((response: SchoolSettingsInterface) => (response)));
  }


  // getSingleHelpPdfBase(object:{routeName:string}) {
  //   return this.http.get<HelpPdfInterface>(environment.apiBaseUrl + '/getSingleHelpPdfBase', {params: object})
  //     .pipe(map((response: HelpPdfInterface) => (response)));
  // }
  // getSingleHelpPdfBaseLogin(object:{routeName:string,language:string}) {
  //   return this.http.get<HelpPdfInterface>(environment.apiBaseUrl + '/getSingleHelpPdfBaseLogin', {params: object})
  //     .pipe(map((response: HelpPdfInterface) => (response)));
  // }


}
