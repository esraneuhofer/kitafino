import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {AccountChargeInterface, ChargeAccountInterface} from "../classes/charge.class";
import {OrderInterfaceStudentSave} from "../classes/order_student_safe.class";
import {ButDocumentInterface, ButStudentInterface} from "../classes/but.class";
import {WeekplanMenuInterface} from "../classes/weekplan.interface";

@Injectable(
  {providedIn: 'root'}
)

export class ButService {

  noAuthHeader = {headers: new HttpHeaders({'NoAuth': 'True'})};

  constructor(private http: HttpClient) {

  }


  getSingleButDocument(query: { _id: string }) {
    return this.http.get<ButDocumentInterface>(environment.apiBaseUrl + '/getSingleButDocument', {params: query})
      .pipe(map((response: ButDocumentInterface) => (response)));
  }

  getButTenant() {
    return this.http.get<ButStudentInterface[]>(environment.apiBaseUrl + '/getButTenant')
      .pipe(map((response: ButStudentInterface[]) => response));
  }

  getButDocumentTenant() {
    return this.http.get<ButDocumentInterface[]>(environment.apiBaseUrl + '/getButDocumentTenant')
      .pipe(map((response: ButDocumentInterface[]) => response));
  }

  addOrEditBut(object: ButStudentInterface) {
    return this.http.post(environment.apiBaseUrl + '/addOrEditBut', object)
      .pipe(map((response: any) => response));
  }

  uploadButDocument(object: ButDocumentInterface) {
    return this.http.post(environment.apiBaseUrl + '/uploadButDocument', object)
      .pipe(map((response: any) => response));
  }
}
