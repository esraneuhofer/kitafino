import { Component } from '@angular/core';
import {OrdersAccountInterface} from "../../../classes/order_account.interface";
import {StudentInterface} from "../../../classes/student.class";
import {OrderService} from "../../../service/order.service";
import {StudentService} from "../../../service/student.service";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {forkJoin} from "rxjs";
import {
  ExportCsvDialogComponent,
  ExportCsvDialogData
} from "../../../directives/export-csv-dialog/export-csv-dialog.component";
import {AccountChargeInterface} from "../../../classes/charge.class";
import {ChargingService} from "../../../service/charging.service";
import {jaOrderNein} from "../../../functions/generell.functions";
import {createXmlFile} from "../account-csv.function";

function sortAccountChargesByDate(accountCharges: AccountChargeInterface[]): AccountChargeInterface[] {
  return accountCharges.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}



@Component({
  selector: 'app-accunt-details',
  templateUrl: './accunt-details.component.html',
  styleUrls: ['./accunt-details.component.scss']
})
export class AccuntDetailsComponent {
  submittingRequest = false;
  pageLoaded = false;
  registeredStudents:StudentInterface[] = [];
  queryYear:number = new Date().getFullYear();


  accountCharges:AccountChargeInterface[] = [];
  page = 1;
  pageSize = 7;
  constructor(private orderService:OrderService,
              private studentService:StudentService,
              private dialog: MatDialog,
              private chargeService: ChargingService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    forkJoin(
      this.studentService.getRegisteredStudentsUser(),
      this.chargeService.getAccountCharges(),
    ).subscribe(
      (
        [
          registeredStudents,
          accountCharges
        ]:
          [StudentInterface[],AccountChargeInterface[]])=>{
        this.accountCharges= sortAccountChargesByDate(accountCharges);
        this.registeredStudents = registeredStudents
        this.pageLoaded = true;
      })
  }

  setPage(number:number){
    this.page += number;
  }

  openDialogExport(){
    const dialogRef = this.dialog.open(ExportCsvDialogComponent, {
      width: '550px',
      data: {header: 'Exportieren', message: 'Bitte wählen Sie den Zeitraum aus den Sie exportieren möchten. Die Datei wird als CSV Datei heruntergeladen', isAccount:true},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });
    dialogRef.afterClosed().subscribe((result:ExportCsvDialogData) => {
      console.log(result);
      if (!result){
        this.submittingRequest = false;
        return;
      }
      createXmlFile(this.accountCharges, result);
    });
  }
  getType(type: string) {
    if (type === 'deposit') {
      return 'Einzahlung'
    }

    return 'Abbuchung'
  }

  formatDateApproved(dateApproved: Date | null): string {
    if (dateApproved) {
      const day = dateApproved.getDate().toString().padStart(2, '0');
      const month = (dateApproved.getMonth() + 1).toString().padStart(2, '0');
      const year = dateApproved.getFullYear().toString().slice(-2);
      return `${day}.${month}.${year}`;
    } else {
      return "Nein";
    }
  }
}
