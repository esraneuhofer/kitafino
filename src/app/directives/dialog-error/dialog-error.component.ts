import {Component, Inject, Input} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {AccountCustomerInterface} from "../../classes/account.class";
import {TenantStudentInterface} from "../../classes/tenant.class";

@Component({
  selector: 'app-dialog-error',
  templateUrl: './dialog-error.component.html',
  styleUrls: ['./dialog-error.component.scss']
})
export class DialogErrorComponent {

  error_header: string = 'Fehler';
  error_message: string = 'Es liegt ein Fehler vor';

  constructor(@Inject(MAT_DIALOG_DATA) public data: {header:string, message: string}) {
    if (data) {
      this.error_header = data.header;
      this.error_message = data.message;
    }

  }
}
