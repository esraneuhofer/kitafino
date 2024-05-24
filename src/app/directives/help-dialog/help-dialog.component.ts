import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss']
})
export class HelpDialogComponent {

  headerHelp:string = 'Bestellung'
  constructor(@Inject(MAT_DIALOG_DATA) public data: {route:string}) {

  }
}
