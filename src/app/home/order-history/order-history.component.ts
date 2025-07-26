import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { OrderService } from "../../service/order.service";
import { OrdersAccountInterface } from "../../classes/order_account.interface";
import { StudentService } from "../../service/student.service";
import { forkJoin } from "rxjs";
import { StudentInterface } from "../../classes/student.class";
import { getStudentNameById } from "../../functions/students.functions";
import {
  ConfirmWithdrawDialogComponent
} from "../account/account-payment/confirm-withdraw-dialog/confirm-withdraw-dialog.component";
import { AccountChargeInterface, ChargeAccountInterface } from "../../classes/charge.class";
import { AccountCustomerInterface } from "../../classes/account.class";
import {
  ExportCsvDialogComponent,
  ExportCsvDialogData
} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { createPdfBuffer, createPdfBufferBuT, getXlsContent } from "./order-history-csv.function";
import { TranslateService } from "@ngx-translate/core";
import { TenantServiceStudent } from "../../service/tenant.service";
import { GenerellService } from "../../service/generell.service";
import { TenantStudentInterface } from "../../classes/tenant.class";
import { MessageDialogService } from "../../service/message-dialog.service";
import { DetailsOrderDialogComponent } from "./details-order-dialog/details-order-dialog.component";
import { OrderInterfaceStudent } from '../../classes/order_student.class';
import { OrderInterfaceStudentSave } from '../../classes/order_student_safe.class';
import { getOrderPlaced } from "../order-student/order.functions";
import { EinrichtungInterface } from '../../classes/einrichtung.class';
import { ToastrService } from 'ngx-toastr';

function getTypeOrder(isCanceled: boolean, translate: TranslateService): string {
  if (!isCanceled) {
    return translate.instant('DASHBOARD.ORDER');
  }
  return translate.instant('ACCOUNTDETAILS.CANCELLATIONS')
}

export interface OrderAndCancelInterface { priceOrder: number, amountOrder: number, nameOrder: string, dateOrder: string, datePlaced: Date, nameStudent: string, typeOrder: string, isCanceled: boolean, isBut?: boolean }

function setDisplayArrayAccountOrders(orderStudentAndCancel: OrderInterfaceStudentSave[], students: StudentInterface[], translate: TranslateService): OrderAndCancelInterface[] {
  let displayArrayAccountOrders: OrderAndCancelInterface[] = [];
  displayArrayAccountOrders = orderStudentAndCancel.map((order) => {
    let studentName = getStudentNameById(order.studentId, students);
    let orderNew: OrderAndCancelInterface = getOrderPlaced(order);
    orderNew.nameStudent = studentName;
    orderNew.typeOrder = getTypeOrder(orderNew.isCanceled, translate);
    return orderNew; // Return orderNew instead of order
  });

  return displayArrayAccountOrders;
}


export interface OrderHistoryTableInterface {
  dateTimeOrder: Date,
  nameStudent: string,
  dateOrderMenu: string,
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
  ordersAccountOwner: OrderInterfaceStudentSave[] = [];
  displayArrayAccountOrders: OrderAndCancelInterface[] = [];
  registeredStudents: StudentInterface[] = [];
  displayArrayAccountOrdersSearch: OrderAndCancelInterface[] = [];
  displayArrayAccountOrdersOriginal: OrderAndCancelInterface[] = [];
  queryYear: number = new Date().getFullYear();
  searchTerm: string = '';
  selectedStudent: StudentInterface | null = null;
  tenantStudent!: TenantStudentInterface;
  availableYears: number[] = [];
  school!: EinrichtungInterface;
  page = 1;
  pageSize = 7;

  constructor(private orderService: OrderService,
    private studentService: StudentService,
    private dialog: MatDialog,
    private dialogeService: MessageDialogService,
    private tenantService: TenantServiceStudent,
    private generellService: GenerellService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    // Initialize available years (last year, current year, next year)
    const currentYear = new Date().getFullYear();
    this.availableYears = [currentYear - 1, currentYear, currentYear + 1];
    console.log('Available years:', this.availableYears);
    forkJoin(
      this.studentService.getRegisteredStudentsUser(),
      this.orderService.getAllOrdersWithCancellations({ year: this.queryYear }),
      this.tenantService.getTenantInformation(),
      this.generellService.getSchoolSettings()
    ).subscribe(
      (
        [registeredStudents, accountOrdersUsers, tenantStudent, school]:
          [StudentInterface[], OrderInterfaceStudentSave[], TenantStudentInterface, EinrichtungInterface]) => {
        this.ordersAccountOwner = accountOrdersUsers;
        this.registeredStudents = registeredStudents
        this.tenantStudent = tenantStudent;
        this.school = school;
        // Set the first student as selected if available
        if (registeredStudents && registeredStudents.length > 0) {
          this.selectedStudent = registeredStudents[0];
        }

        // Create combined display array and sort by dateOrderMenu
        const combinedOrders = setDisplayArrayAccountOrders(accountOrdersUsers, registeredStudents, this.translate);

        // Sort orders by date descending (newest first)
        this.displayArrayAccountOrdersOriginal = combinedOrders.sort((a, b) => {
          // First sort by date (newest first)
          const dateComparison = new Date(b.dateOrder).getTime() - new Date(a.dateOrder).getTime();

          if (dateComparison !== 0) {
            return dateComparison;
          }

          // If dates are equal, sort by time of order (newest first)
          return new Date(b.dateOrder).getTime() - new Date(a.dateOrder).getTime();
        });

        // Filter by selected student
        this.filterOrdersByStudent();
        this.pageLoaded = true;
      })
  }

  search(value: any): void {
    this.searchTerm = value.target.value;
    this.filterOrdersByStudent();
  }

  filterOrdersByStudent(): void {
    if (!this.selectedStudent) {
      this.displayArrayAccountOrdersSearch = [];
      this.displayArrayAccountOrders = [];
      return;
    }

    // Filter orders by selected student and year
    const studentName = `${this.selectedStudent.firstName} ${this.selectedStudent.lastName}`;
    this.displayArrayAccountOrdersSearch = this.displayArrayAccountOrdersOriginal.filter(order => {
      const orderYear = new Date(order.dateOrder).getFullYear();
      return order.nameStudent === studentName && orderYear === this.queryYear;
    });

    // Apply search filter if there's a search term
    if (this.searchTerm) {
      this.displayArrayAccountOrders = this.displayArrayAccountOrdersSearch.filter((val) =>
        val.nameStudent.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.displayArrayAccountOrders = [...this.displayArrayAccountOrdersSearch];
    }
  }

  onStudentChange(): void {
    this.searchTerm = ''; // Reset search term when student changes
    this.page = 1; // Reset to first page
    this.filterOrdersByStudent();
  }

  onYearChange(): void {
    this.searchTerm = ''; // Reset search term when year changes
    this.page = 1; // Reset to first page
    this.loadOrdersForYear();
  }

  private loadOrdersForYear(): void {
    this.pageLoaded = false;
    this.orderService.getAllOrdersWithCancellations({ year: this.queryYear }).subscribe(
      (accountOrdersUsers: OrderInterfaceStudentSave[]) => {
        this.ordersAccountOwner = accountOrdersUsers;

        // Create combined display array and sort by dateOrderMenu
        const combinedOrders = setDisplayArrayAccountOrders(accountOrdersUsers, this.registeredStudents, this.translate);

        // Sort orders by date descending (newest first)
        this.displayArrayAccountOrdersOriginal = combinedOrders.sort((a, b) => {
          // First sort by date (newest first)
          const dateComparison = new Date(b.dateOrder).getTime() - new Date(a.dateOrder).getTime();

          if (dateComparison !== 0) {
            return dateComparison;
          }

          // If dates are equal, sort by time of order (newest first)
          return new Date(b.dateOrder).getTime() - new Date(a.dateOrder).getTime();
        });

        // Filter by selected student and year
        this.filterOrdersByStudent();
        this.pageLoaded = true;
      },
      (error) => {
        console.error('Error loading orders for year:', error);
        this.pageLoaded = true;
      }
    );
  }

  setPage(number: number) {
    this.page += number;
  }

  openDialogExport() {
    if (!this.selectedStudent) {
      this.toastr.error(this.translate.instant('ORDER_HISTORY.SELECT_STUDENT'), this.translate.instant('ERROR_TITLE'));
      return;
    }
    let header = this.translate.instant('ACCOUNTDETAILS.EXPORT') + ' -  ' + this.selectedStudent.firstName + ' ' + this.selectedStudent?.lastName;
    let content = this.translate.instant('ORDER_HISTORY.MESSAGE_DIALOG');
    const dialogRef = this.dialog.open(ExportCsvDialogComponent, {
      width: '550px',
      data: { header: header, message: content },
      panelClass: 'custom-dialog-container',
      position: { top: '100px' }
    });

    dialogRef.afterClosed().subscribe((result: ExportCsvDialogData) => {
      let xlsBlob: Blob;
      if (!result) {
        this.submittingRequest = false;
        return;
      }

      // Check if secondDate is greater than yesterday and adjust if needed
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999); // Set to end of yesterday

      if (result.secondDate && new Date(result.secondDate) > yesterday) {
        result.secondDate = yesterday.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      // Use the filtered orders (displayArrayAccountOrdersSearch) instead of all orders
      if (result.typeDownload === 'csv') {
        let xlsContent = getXlsContent(this.displayArrayAccountOrdersSearch, result);
        xlsBlob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
        this.generellService.sendCSVEmail({
          file: xlsBlob,
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
      } else {
        if (!this.selectedStudent) {
          this.toastr.error(this.translate.instant('Bitte wenden Sie sich an den Support'), this.translate.instant('Fehler'));
          return;
        }
        createPdfBufferBuT(this.displayArrayAccountOrdersSearch, result, this.selectedStudent, this.school).then(pdfBlob => {
          // createPdfBuffer(this.displayArrayAccountOrdersSearch, result).then(pdfBlob => {
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
  openDetailsOrder(order: OrderAndCancelInterface) {
    const dialogRef = this.dialog.open(DetailsOrderDialogComponent, {
      width: '550px',
      data: order,
      panelClass: 'custom-dialog-container',
      position: { top: '100px' }
    });
  }

}
