import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-settings-table-order-students',
  templateUrl: './settings-table-order-students.component.html',
  styleUrls: ['./settings-table-order-students.component.scss']
})
export class SettingsTableOrderStudentsComponent {

  @Input() ordersCustomer:any[] = [];
}
