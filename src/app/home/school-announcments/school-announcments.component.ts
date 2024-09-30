import { Component } from '@angular/core';
import {MessageService} from "../../service/message.service";
import {SchoolMessageInterface} from "../../classes/school-message.interface";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin} from "rxjs";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {TenantServiceStudent} from "../../service/tenant.service";

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
      this.allMessages =  messages
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
