import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs";
import {EinrichtungInterface} from "../classes/einrichtung.class";


@Injectable(
  {providedIn: 'root'}
)

export class SchoolService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  getSchoolSettings(){
    return this.http.get<EinrichtungInterface>(environment.apiBaseUrl+'/getSchoolSettings')
      .pipe(map((response: EinrichtungInterface) => (response)));
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
