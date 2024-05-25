import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryInterOrderInterface} from "../../functions/weekplan.functions";
import {SchoolMessageInterface} from "../../classes/school-message.interface";

@Component({
  selector: 'app-message-info-box',
  templateUrl: './message-info-box.component.html',
  styleUrls: ['./message-info-box.component.scss']
})
export class MessageInfoBoxComponent {
  @Input() eachMessage!: SchoolMessageInterface | null;
  @Output() closeMessage:any = new EventEmitter<SchoolMessageInterface>();

    constructor() {
      console.log(this.eachMessage);
    }

  closeInfo(message: SchoolMessageInterface) {
    this.closeMessage.emit(message);
  }
  getMessageHeader(sentBy:string) {
    if (sentBy === 'master') {
      return 'Nachricht von Cateringexpert';
    } else if(sentBy === 'school') {
      return 'Nachricht von der Einrichtung';
    }else{
      return 'Nachricht vom Caterer'
    }
  }

}
