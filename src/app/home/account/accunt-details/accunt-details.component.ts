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
import {TenantServiceStudent} from "../../../service/tenant.service";
import {GenerellService} from "../../../service/generell.service";
import {TenantStudentInterface} from "../../../classes/tenant.class";
import {MessageDialogService} from "../../../service/message-dialog.service";
import {sortAccountChargesByDate} from "../account-payment-overview/account-payment-overview.component";


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
  tenantStudent!: TenantStudentInterface;


  accountCharges:AccountChargeInterface[] = [];
  page = 1;
  pageSize = 7;
  goBack(){
    this.router.navigate(['../home/account_overview'], {relativeTo: this.r.parent});
  }
  constructor(private orderService:OrderService,
              private studentService:StudentService,
              private dialog: MatDialog,
              private chargeService: ChargingService,
              private router: Router,
              private dialogeService:MessageDialogService,
              private r: ActivatedRoute,
              private tenantService: TenantServiceStudent,
              private generellService: GenerellService,
              private translate: TranslateService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    forkJoin(
      this.studentService.getRegisteredStudentsUser(),
      this.chargeService.getAccountCharges(),
      this.tenantService.getTenantInformation(),

    ).subscribe(
      (
        [
          registeredStudents,
          accountCharges,
          tenantStudent
        ]:
          [StudentInterface[],AccountChargeInterface[],TenantStudentInterface])=>{
        this.accountCharges= sortAccountChargesByDate(accountCharges);
        this.registeredStudents = registeredStudents;
        this.tenantStudent = tenantStudent;

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
      let xlsContent  = createXmlFile(this.accountCharges, result);
      const xlsBlob = new Blob([xlsContent], {type: 'application/vnd.ms-excel'});

      this.generellService.sendCSVEmail({
        file: xlsBlob,
        firstDate: result.firstDate,
        secondDate: result.secondDate,
        type: 'Kontobewegungen',
        email:this.tenantStudent.email
      }).subscribe(response => {
        this.dialogeService.openMessageDialog(
          this.translate.instant("CSV_WURDE_ERFOLGREICH_VERSENDET"),
          this.translate.instant("SUCCESS"),
          'success');
      }, error => {
        this.dialogeService.openMessageDialog(
          this.translate.instant("ES_GAB_EIN_FEHLER_BEIM_VERSAND_DER_CSV_DATEI"),
          this.translate.instant("ERROR_TITLE"),
          'warning');
      });
    });
  }
}
