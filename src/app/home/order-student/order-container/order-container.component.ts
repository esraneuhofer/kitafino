import {Component, Input, OnInit} from '@angular/core';
import {OrderStudentInterface} from "../../../classes/order.class";
import {OrderInterfaceStudent} from "../../../classes/order_student.class";
import {SettingInterfaceNew} from "../../../classes/setting.class";

function getLockedStatus(pastOrder:boolean,lockDay:boolean):boolean{
  if(pastOrder || lockDay){
    return true;
  }
  return false;
}

@Component({
  selector: 'app-order-container',
  templateUrl: './order-container.component.html',
  styleUrls: ['./order-container.component.scss']
})
export class OrderContainerComponent implements OnInit{

  @Input() settings!:SettingInterfaceNew;
  @Input() selectedDate!: string;
  @Input() lockDays!: boolean[];
  @Input() indexDaySelected!: number;
  @Input() pastOrder!: boolean;
  @Input() orderModel!:OrderInterfaceStudent

  isLocked:boolean = false;
  constructor() {
  }

  ngOnInit() {
    // this.isLocked = getLockedStatus(this.pastOrder,this.lockDays[this.indexDaySelected]);
  }
}
