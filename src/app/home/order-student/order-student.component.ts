import {Component, OnInit} from '@angular/core';
import {timeDifference} from "./order.functions";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {GenerellService} from "../../service/generell.service";

@Component({
  selector: 'app-order-student',
  templateUrl: './order-student.component.html',
  styleUrls: ['./order-student.component.scss']
})
export class OrderStudentComponent implements OnInit{


  differenceTimeDeadline:string = '';
  pastOrder:boolean = false;
  timerInterval:any;
  dateChange:Date = new Date();

  settings!:SettingInterfaceNew;
  constructor(private generellService:GenerellService) {
  }

  ngOnInit() {
    this.generellService.getSettingsTenant().subscribe((settings:SettingInterfaceNew) => {
      console.log(settings);
      this.settings = settings;
      this.checkDeadline(new Date());

    })
  }

  checkDeadline(day:Date) {
    const distance = timeDifference(this.settings.orderSettings.deadLineDaily, day);
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

  getOrderDay(day:Date) {
    this.checkDeadline(day)
  }
}
