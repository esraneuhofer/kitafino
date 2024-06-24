import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {OrderHistoryTableInterface} from "../order-history.component";

@Component({
  selector: 'app-details-order-dialog',
  templateUrl: './details-order-dialog.component.html',
  styleUrls: ['./details-order-dialog.component.scss']
})
export class DetailsOrderDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: OrderHistoryTableInterface) {
  }
}
