import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {OrderInterfaceStudent} from "../../../classes/order_student.class";
import {getTotalPrice} from "../../order-student/order.functions";

@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.scss']
})
export class ConfirmOrderComponent {

  total:number = 0;
  sendCopyEmail:boolean = true;
  header:string = 'Bestellung abschließen';
  text:string = 'Mit dem absenden der Bestellung wird Ihr Konto mit dem folgenden Betrag belastet:'
  btnText:string = 'Bestellen'
  buttonType:string =  'primary';
  constructor(@Inject(MAT_DIALOG_DATA) private data: { orderStudent:OrderInterfaceStudent,type:string,indexMenu:number } ) {
    this.total = data.orderStudent.order.orderMenus[data.indexMenu].priceOrder
    if(data.type === 'cancel'){
      this.header = 'Bestellung stornieren';
      this.text  = 'Mit dem absenden der Stornierung wird Ihrem Konto mit dem folgenden Betrag gutgeschrieben:'
      this.btnText = 'Stornieren'
      this.buttonType =  'danger';
    }
    if(data.type === 'edit'){
      this.header = 'Bestellung ändern';
      this.text  = 'Mit dem absenden der Änderung wird die ursprüngliche Bestellung storniert und anschließend die neue Bestellung abgeschlossen.'
      this.btnText = 'Ändern'
      this.buttonType =  'warning';
    }
  }
}
