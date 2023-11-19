import {Component, Input} from '@angular/core';
import {MenuInterface} from "../../../classes/menu.interface";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {OrderModelInterfaceNew, OrderSubDetailNew} from "../../../classes/order.class";

@Component({
  selector: 'app-meal-input-card',
  templateUrl: './meal-input-card.component.html',
  styleUrls: ['./meal-input-card.component.scss']
})
export class MealInputCardComponent {

  // @Input() allMenus:MenuInterface[];
  // @Input() menuItem:OrderSubDetailNew
  @Input() pastOrder:boolean = false;
  @Input() lockDay:boolean[] = [false,false,false,false,false]
  @Input() indexDay:number = 1;
  // @Input() indexMenu:number
  // @Input() orderModel:OrderModelInterfaceNew
  // @Input() indexSubGroup:number
  // @Input() settings:SettingInterfaceNew
  // @Input() allowOneMenuEachDay:boolean;
  @Input() minHeightMenu:number = 160

}
