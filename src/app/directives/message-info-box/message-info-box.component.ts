import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryInterOrderInterface} from "../../functions/weekplan.functions";
import {SchoolMessageInterface} from "../../classes/school-message.interface";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-message-info-box',
  templateUrl: './message-info-box.component.html',
  styleUrls: ['./message-info-box.component.scss']
})
export class MessageInfoBoxComponent {
  @Input() eachMessage!: SchoolMessageInterface | null;
  @Input() showButton: boolean = true;
  @Output() closeMessage:any = new EventEmitter<SchoolMessageInterface>();

    constructor(private translate: TranslateService) {
      console.log(this.eachMessage);
    }

  closeInfo(message: SchoolMessageInterface) {
    this.closeMessage.emit(message);
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
