import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {formatDateInput} from "../../functions/date.functions";

@Component({
  selector: 'app-export-csv-dialog',
  templateUrl: './export-csv-dialog.component.html',
  styleUrls: ['./export-csv-dialog.component.scss']
})
export class ExportCsvDialogComponent {

  firstDate: string;
  secondDate: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {header:string, message: string}) {
    this.firstDate = this.formatDateInput(new Date());
    this.secondDate = this.formatDateInput(new Date());
  }
  formatDateInput(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  onDateChange(event: any, dateType: string) {
    if (dateType === 'firstDate') {
      this.firstDate = event.target.value;
    } else if (dateType === 'secondDate') {
      this.secondDate = event.target.value;
    }
  }

}
