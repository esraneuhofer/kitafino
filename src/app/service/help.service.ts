import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map, Observable} from "rxjs";
import {SchoolMessageInterface} from "../classes/school-message.interface";
import {OrderInterfaceStudentSave} from "../classes/order_student_safe.class";

export interface HelpPdfInterface {
  routeName: string;
  pdfPath: string;
  lang: string;
  nameFile: string;
  filename: string;
  _id: string;
}

@Injectable(
  {providedIn: 'root'}
)

export class HelpService {

  noAuthHeader = {headers: new HttpHeaders({'NoAuth': 'True'})};

  constructor(private http: HttpClient) {

  }

  getAllHelpPdfNames() {
    return this.http.get<any[]>(environment.apiBaseUrl + '/getAllHelpPdfNames')
      .pipe(map((response: any[]) => (response)));
  }


  getSingleHelpPdfBase(object: { routeName: string }) {
    console.log(object.routeName)
    return this.http.get<HelpPdfInterface>(environment.apiBaseUrl + '/getSingleHelpPdfBase', {params: object})
      .pipe(map((response: HelpPdfInterface) => (response)));
  }

  uploadHelpPdf(formData: FormData): Observable<any> {
    return this.http.post(environment.apiBaseUrl + '/addHelpImage', formData)
      .pipe(map((response: any) => response));
  }

  downloadHelpPdf(id: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token') // Angenommen, der Token wird im localStorage gespeichert
    });
    return this.http.get(`${environment.apiBaseUrl}/download/${id}`, { headers: headers, responseType: 'blob' });
  }

}
