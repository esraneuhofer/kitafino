import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {OrderService} from "../../service/order.service";
import {OrdersAccountInterface} from "../../classes/order_account.interface";
import {StudentService} from "../../service/student.service";
import {forkJoin} from "rxjs";
import {StudentInterface} from "../../classes/student.class";
import {getStudentNameById} from "../../functions/students.functions";
import {
  ConfirmWithdrawDialogComponent
} from "../account/account-payment/confirm-withdraw-dialog/confirm-withdraw-dialog.component";
import {AccountChargeInterface, ChargeAccountInterface} from "../../classes/charge.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {
  ExportCsvDialogComponent,
  ExportCsvDialogData
} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {createPdfBuffer, getXlsContent} from "./order-history-csv.function";
import {TranslateService} from "@ngx-translate/core";
import {TenantServiceStudent} from "../../service/tenant.service";
import {GenerellService} from "../../service/generell.service";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {MessageDialogService} from "../../service/message-dialog.service";
import {DetailsOrderDialogComponent} from "./details-order-dialog/details-order-dialog.component";

function getTypeOrder(input: string, translate: TranslateService): string {
  if (input === 'order') {
    return translate.instant('DASHBOARD.ORDER');
  }
  return translate.instant('ACCOUNTDETAILS.CANCELLATIONS')
}

function setDisplayArrayAccountOrders(ordersAccountOwner: OrdersAccountInterface[], students: StudentInterface[], translate: TranslateService): OrderHistoryTableInterface[] {
  let displayArrayAccountOrders: OrderHistoryTableInterface[] = [];
  ordersAccountOwner.forEach((orderAccountOwner: OrdersAccountInterface) => {
    orderAccountOwner.allOrdersDate.forEach((allOrdersDate) => {
      allOrdersDate.order.forEach((order) => {
        displayArrayAccountOrders.push({
          dateOrderMenu: orderAccountOwner.dateOrderMenu,
          nameStudent: getStudentNameById(orderAccountOwner.studentId, students),
          dateTimeOrder: allOrdersDate.dateTimeOrder,
          typeOrder: getTypeOrder(allOrdersDate.type, translate),
          price: order.priceMenu,
          year: orderAccountOwner.year,
          nameMenu: order.nameOrder
        })
      })
    })
  })
  return displayArrayAccountOrders;
}

export interface OrderHistoryTableInterface {
  dateTimeOrder: Date,
  nameStudent: string,
  dateOrderMenu: Date,
  typeOrder: string,
  price: number,
  nameMenu: string,
  year: number
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  submittingRequest = false;
  pageLoaded = false;
  ordersAccountOwner: OrdersAccountInterface[] = [];
  displayArrayAccountOrders: OrderHistoryTableInterface [] = [];
  registeredStudents: StudentInterface[] = [];
  displayArrayAccountOrdersSearch: OrderHistoryTableInterface [] = [];
  queryYear: number = new Date().getFullYear();
  searchTerm: string = '';
  tenantStudent!: TenantStudentInterface;

  page = 1;
  pageSize = 7;

  constructor(private orderService: OrderService,
              private studentService: StudentService,
              private dialog: MatDialog,
              private dialogeService:MessageDialogService,
              private tenantService: TenantServiceStudent,
              private generellService: GenerellService,
              private router: Router,
              private translate: TranslateService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    forkJoin(
      this.studentService.getRegisteredStudentsUser(),
      this.orderService.getAccountOrderUserYear({year: new Date().getFullYear()}),
      this.tenantService.getTenantInformation(),
    ).subscribe(
      (
        [registeredStudents, accountOrdersUsers,tenantStudent]:
          [StudentInterface[], OrdersAccountInterface[],TenantStudentInterface]) => {
        this.ordersAccountOwner = accountOrdersUsers;
        this.registeredStudents = registeredStudents
        this.tenantStudent = tenantStudent;

        this.displayArrayAccountOrders = this.displayArrayAccountOrdersSearch = setDisplayArrayAccountOrders(accountOrdersUsers, registeredStudents, this.translate);
        this.pageLoaded = true;
      })
  }

  search(value: any): void {
    this.displayArrayAccountOrders = this.displayArrayAccountOrdersSearch.filter((val) => val.nameStudent.toLowerCase().includes(value.target.value.toLowerCase()))

  }

  setPage(number: number) {
    this.page += number;
  }

  openDialogExport() {
    let header = this.translate.instant('EXPORT');
    let content = this.translate.instant('ORDER_HISTORY.MESSAGE_DIALOG');
    const dialogRef = this.dialog.open(ExportCsvDialogComponent, {
      width: '550px',
      data: {header: header, message: content},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });

    dialogRef.afterClosed().subscribe((result: ExportCsvDialogData) => {
      let xlsBlob: Blob;
      if (!result) {
        this.submittingRequest = false;
        return;
      }
      if(result.typeDownload === 'csv'){
        let xlsContent = getXlsContent(this.displayArrayAccountOrdersSearch, result);
        xlsBlob = new Blob([xlsContent], {type: 'application/vnd.ms-excel'});
        this.generellService.sendCSVEmail({
          file: xlsBlob,
          firstDate: result.firstDate,
          secondDate: result.secondDate,
          type: 'Bestellverlauf',
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
      }else{
        createPdfBuffer(this.displayArrayAccountOrdersSearch, result).then(pdfBlob => {
          this.generellService.sendPDFEmail({
            file: pdfBlob,
            firstDate: result.firstDate,
            secondDate: result.secondDate,
            type: 'Bestellverlauf',
            email: this.tenantStudent.email
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
        })

      }
      // downloadOrderHistoryCsv(this.displayArrayAccountOrdersSearch, result);
    });
  }
  openDetailsOrder(order:OrderHistoryTableInterface){
    const dialogRef = this.dialog.open(DetailsOrderDialogComponent, {
      width: '550px',
      data: order,
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });
  }

}
