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


  constructor(@Inject(MAT_DIALOG_DATA) public data: {header:string, message: string,typeMessage:string}) {

  }
}
