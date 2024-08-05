import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { OrderInterfaceStudent } from "../../../classes/order_student.class";
import { TenantStudentInterface } from "../../../classes/tenant.class";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.scss']
})
export class ConfirmOrderComponent {

  total: number = 0;
  sendCopyEmail: boolean = true;
  header: string;
  text: string;
  btnText: string;
  buttonType: string = 'primary';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: {
      tenantStudent: TenantStudentInterface,
      orderStudent: OrderInterfaceStudent,
      type: string,
      indexMenu: number
    },
    private translate: TranslateService
  ) {
    this.sendCopyEmail = this.data.tenantStudent.orderSettings.orderConfirmationEmail;
    this.total = data.orderStudent.order.orderMenus[data.indexMenu].priceOrder;

    switch (data.type) {
      case 'cancel':
        this.header = this.translate.instant('STORNIERUNG_HEADER');
        this.text = this.translate.instant('STORNIERUNG_TEXT_DIALOG');
        this.btnText = this.translate.instant('STORNIEREN_BUTTON');
        this.buttonType = 'danger';
        break;
      case 'edit':
        this.header = this.translate.instant('BESTELLUNG_AENDERN_HEADER');
        this.text = this.translate.instant('BESTELLUNG_AENDERN_TEXT');
        this.btnText = this.translate.instant('AENDERN_BUTTON');
        this.buttonType = 'warning';
        break;
      default:
        this.header = this.translate.instant('BESTELLUNG_ABSCHLIESSEN_HEADER');
        this.text = this.translate.instant('BESTELLUNG_ABSCHLIESSEN_TEXT');
        this.btnText = this.translate.instant('BESTELLEN_BUTTON');
        break;
    }
  }
}
