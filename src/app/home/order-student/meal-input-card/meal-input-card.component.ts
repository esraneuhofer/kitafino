import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MenuInterface} from "../../../classes/menu.interface";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {OrderInterfaceStudent} from "../../../classes/order_student.class";
import {MealCardInterface} from "../order-container/order-container.component";
import localeDe from '@angular/common/locales/de';
import {registerLocaleData} from "@angular/common";
import {modifyOrderModelForSave} from "../../../functions/order.functions";
import {OrderService} from "../../../service/order.service";
import {addDayFromDate, timeDifference} from "../order.functions";

registerLocaleData(localeDe);
@Component({
  selector: 'app-meal-input-card',
  templateUrl: './meal-input-card.component.html',
  styleUrls: ['./meal-input-card.component.scss']
})
export class MealInputCardComponent implements OnInit, OnDestroy{
  @Input() orderDay!:MealCardInterface
  @Input() settings!:SettingInterfaceNew;
  @Output() orderPlaced: any = new EventEmitter<Event>;

  differenceTimeDeadline:string = '';
  timerInterval: any;

  pastOrder:boolean = true;
  submittingRequest: boolean = false;
  constructor(private orderService:OrderService) {

  }

  ngOnInit() {
    this.checkDeadline(this.orderDay.date);
  }

  saveOrder(orderModel:OrderInterfaceStudent) {
    this.submittingRequest = true;
    let orderModifiedForSave = modifyOrderModelForSave(orderModel);
    console.log(orderModifiedForSave)
    this.orderService.addOrderStudentDay(orderModifiedForSave).subscribe((data: any) => {
      console.log(data);
      this.orderPlaced.emit(true);
    })

  }
  editOrder(orderModel:OrderInterfaceStudent) {

  }

  checkDeadline(day: Date): void {
    const distance = timeDifference(this.settings.orderSettings.deadLineDaily, day);
    console.log(distance);
    if (!distance) {
      this.pastOrder = true;
      this.differenceTimeDeadline = 'Abbestellfrist ist abgelaufen!';
      clearInterval(this.timerInterval);
    } else {
      clearInterval(this.timerInterval);
      this.pastOrder = false;
      this.differenceTimeDeadline = distance;
      this.timerInterval = setInterval(() => {
        this.checkDeadline(day);
      }, 1000);
    }
  }
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
