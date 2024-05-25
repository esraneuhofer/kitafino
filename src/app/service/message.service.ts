import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {OrderInterfaceStudentSave} from "../classes/order_student_safe.class";
import {map} from "rxjs";
import {SchoolMessageInterface} from "../classes/school-message.interface";


@Injectable(
    {providedIn: 'root'}
)

export class MessageService {

    noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

    constructor(private http:HttpClient) {

    }
    getMessages(){
        return this.http.get<SchoolMessageInterface[]>(environment.apiBaseUrl+'/getMessages')
            .pipe(map((response: SchoolMessageInterface[]) => (response)));
    }

    editMessage(object: SchoolMessageInterface) {
        return this.http.post(environment.apiBaseUrl + '/editMessage', object)
            .pipe(map((response: any) => response));
    }
    addMessage(object: SchoolMessageInterface) {
        return this.http.post(environment.apiBaseUrl + '/addMessage', object)
            .pipe(map((response: any) => response));
    }

}
