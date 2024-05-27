import { Component } from '@angular/core';
import {MessageService} from "../../service/message.service";
import {SchoolMessageInterface} from "../../classes/school-message.interface";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-school-announcments',
  templateUrl: './school-announcments.component.html',
  styleUrls: ['./school-announcments.component.scss']
})
export class SchoolAnnouncmentsComponent {
  allMessages: SchoolMessageInterface[] = [];
  pageLoaded: boolean = false
  constructor(private messageService: MessageService,private translate: TranslateService) {
    this.messageService.getMessages().subscribe((messages: SchoolMessageInterface[]) => {
      this.allMessages = messages;
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
