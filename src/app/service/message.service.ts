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
    getMessagesActive(){
        return this.http.get<SchoolMessageInterface>(environment.apiBaseUrl+'/getAccountTenant')
            .pipe(map((response: SchoolMessageInterface) => (response)));
    }
    getMessagesInactive(){
        return this.http.get<SchoolMessageInterface>(environment.apiBaseUrl+'/getAccountTenant')
            .pipe(map((response: SchoolMessageInterface) => (response)));
    }
    editMessage(object: SchoolMessageInterface) {
        return this.http.post(environment.apiBaseUrl + '/addOrderStudentDay', object)
            .pipe(map((response: any) => response));
    }
}
