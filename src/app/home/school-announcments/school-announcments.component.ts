import { Component } from '@angular/core';
import {MessageService} from "../../service/message.service";
import {SchoolMessageInterface} from "../../classes/school-message.interface";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin} from "rxjs";
import {customerIdContainedInMessasge} from "../dashboard/dashboard.component";
import {CustomerInterface} from "../../classes/customer.class";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {TenantServiceStudent} from "../../service/tenant.service";
function checkMessages(data:SchoolMessageInterface[],tenant:TenantStudentInterface){
  let array:SchoolMessageInterface[] = [];
  data.forEach((message) => {
    if(message.customers && message.customers.length === 0){
      array.push(message);
    }else{
      if(customerIdContainedInMessasge(message.customers,tenant)){
        array.push(message);
      }
    }
  })
  return array;
}
@Component({
  selector: 'app-school-announcments',
  templateUrl: './school-announcments.component.html',
  styleUrls: ['./school-announcments.component.scss']
})
export class SchoolAnnouncmentsComponent {
  allMessages: SchoolMessageInterface[] = [];
  pageLoaded: boolean = false;
  tenantStudent!: TenantStudentInterface;

  constructor(private messageService: MessageService,private translate: TranslateService, private tenantServiceStudent:TenantServiceStudent) {
    forkJoin(
      this.messageService.getMessages(),
      this.tenantServiceStudent.getTenantInformation(),
    ).subscribe(([messages,tenant]: [SchoolMessageInterface[],TenantStudentInterface]) => {
      this.allMessages = checkMessages(messages,tenant);
      this.tenantStudent = tenant;
      this.pageLoaded = true;
    })
  }
  getMessageHeader(sentBy: string) {
    if (sentBy === 'master') {
      return this.translate.instant('MESSAGE_FROM_CATERINGEXPERT');
    } else if (sentBy === 'school') {
      return this.translate.instant('MESSAGE_FROM_SCHOOL');
    } else {
      return this.translate.instant('MESSAGE_FROM_CATERER');
    }
  }
}
