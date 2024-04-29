import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {StudentInterface, StudentInterfaceId} from "../classes/student.class";


@Injectable(
  {providedIn: 'root'}
)

export class StudentService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http:HttpClient) {

  }
  getRegisteredStudentsUser(){
    return this.http.get<StudentInterfaceId[]>(environment.apiBaseUrl+'/getRegisteredStudentsUser')
      .pipe(map((response: StudentInterfaceId[]) => (response)));
  }
  hasRegisteredStudent(): Observable<boolean> {
    return this.getRegisteredStudentsUser().pipe(
      map((students: StudentInterface[]) => students && students.length > 0),
      catchError((error) => {
        console.error(error);
        return of(false); // If there's an error, you can assume no students are registered.
      })
    );
  }
  editRegisteredUser(object:StudentInterface){
    return this.http.post(environment.apiBaseUrl+'/editRegisteredUser',object)
      .pipe(map((response: any) => response));
  }
  addStudent(object:StudentInterface){
    return this.http.post(environment.apiBaseUrl+'/addStudent',object)
        .pipe(map((response: any) => response));
  }
  editStudent(object:StudentInterface){
    return this.http.post(environment.apiBaseUrl+'/editStudent',object)
      .pipe(map((response: any) => response));
  }
  deleteStudent(object:StudentInterface){
    return this.http.post(environment.apiBaseUrl+'/deleteStudent',object)
      .pipe(map((response: any) => response));
  }



}
