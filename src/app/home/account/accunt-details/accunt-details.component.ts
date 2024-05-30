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
import {TranslateService} from "@ngx-translate/core";

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
  goBack(){
    console.log('go back');
    this.router.navigate(['../home/account_overview'], {relativeTo: this.r.parent});
  }
  constructor(private orderService:OrderService,
              private studentService:StudentService,
              private dialog: MatDialog,
              private chargeService: ChargingService,
              private router: Router,
              private r: ActivatedRoute,
              private translate: TranslateService,
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
    let header = this.translate.instant('ACCOUNTDETAILS.HEADER_EXPORT');
    let content = this.translate.instant('ACCOUNTDETAILS.CONTENT_EXPORT');
    const dialogRef = this.dialog.open(ExportCsvDialogComponent, {
      width: '550px',
      data: {header: header, message: content, isAccount:true},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });
    dialogRef.afterClosed().subscribe((result:ExportCsvDialogData) => {
      if (!result){
        this.submittingRequest = false;
        return;
      }
      createXmlFile(this.accountCharges, result);
    });
  }
}
