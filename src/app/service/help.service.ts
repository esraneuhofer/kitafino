import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map} from "rxjs";
import {SchoolMessageInterface} from "../classes/school-message.interface";
import {OrderInterfaceStudentSave} from "../classes/order_student_safe.class";

export interface HelpPdfInterface {
  routeName:string;
  base64:string;
  lang:string;
  nameFile:string;
}

@Injectable(
  {providedIn: 'root'}
)

export class HelpService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  getAllHelpPdfNames(){
    return this.http.get<any[]>(environment.apiBaseUrl+'/getAllHelpPdfNames')
      .pipe(map((response: any[]) => (response)));
  }


  getSingleHelpPdfBase(object:{routeName:string}) {
    console.log(object.routeName)
    return this.http.get<HelpPdfInterface>(environment.apiBaseUrl + '/getSingleHelpPdfBase', {params: object})
      .pipe(map((response: HelpPdfInterface) => (response)));
  }


}
