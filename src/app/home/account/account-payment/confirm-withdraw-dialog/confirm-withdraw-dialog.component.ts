import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {OrderInterfaceStudent} from "../../../../classes/order_student.class";
import {AccountCustomerInterface} from "../../../../classes/account.class";
import {TenantStudentInterface} from "../../../../classes/tenant.class";

@Component({
  selector: 'app-confirm-withdraw-dialog',
  templateUrl: './confirm-withdraw-dialog.component.html',
  styleUrls: ['./confirm-withdraw-dialog.component.scss']
})
export class ConfirmWithdrawDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { accountTenant:AccountCustomerInterface, tenantStudent:TenantStudentInterface } ) {

  }
  formatIban(iban: string | undefined): string {
    if(!iban){
      return 'Keine IBAN hinterlegt';
    }
    const formattedIban = 'DE' + iban; // DE hinzufügen
    return formattedIban.replace(/(.{4})/g, '$1 ');
  }
}
