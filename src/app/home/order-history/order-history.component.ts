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
import {ExportCsvDialogComponent} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import {MatDialog} from "@angular/material/dialog";

function getTypeOrder(input:string):string{
  if(input === 'order'){
    return 'Bestellung';
  }
  return 'Stornierung'
}
function setDisplayArrayAccountOrders(ordersAccountOwner:OrdersAccountInterface[],students:StudentInterface[]):OrderHistoryTableInterface[]{
  let displayArrayAccountOrders:OrderHistoryTableInterface[] = [];
  ordersAccountOwner.forEach((orderAccountOwner:OrdersAccountInterface)=>{
    orderAccountOwner.allOrdersDate.forEach((allOrdersDate)=>{
      allOrdersDate.order.forEach((order)=>{
        displayArrayAccountOrders.push({
          dateOrderMenu:orderAccountOwner.dateOrderMenu,
          nameStudent:getStudentNameById(orderAccountOwner.studentId,students),
          dateTimeOrder:allOrdersDate.dateTimeOrder,
          typeOrder:getTypeOrder(allOrdersDate.type),
          price:order.priceMenu,
          year:orderAccountOwner.year,
          nameMenu:order.nameOrder
        })
      })
    })
  })
  return displayArrayAccountOrders;
}

interface OrderHistoryTableInterface {
  dateTimeOrder:Date,
  nameStudent:string,
  dateOrderMenu:Date,
  typeOrder:string,
  price:number,
  nameMenu:string,
year:number}
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit{

  submittingRequest = false;
  pageLoaded = false;
  ordersAccountOwner:OrdersAccountInterface[] = [];
  displayArrayAccountOrders:OrderHistoryTableInterface [] = [];
  registeredStudents:StudentInterface[] = [];
  displayArrayAccountOrdersSearch:OrderHistoryTableInterface [] = [];
  queryYear:number = new Date().getFullYear();
  searchTerm:string = '';

  page = 1;
  pageSize = 7;
  constructor(private orderService:OrderService,
              private studentService:StudentService,
              private dialog: MatDialog,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    forkJoin(
      this.studentService.getRegisteredStudentsUser(),
      this.orderService.getAccountOrderUserYear({year:new Date().getFullYear()})
    ).subscribe(
      (
        [registeredStudents,accountOrdersUsers]:
          [StudentInterface[],OrdersAccountInterface[]])=>{
      this.ordersAccountOwner = accountOrdersUsers;
      this.registeredStudents = registeredStudents
       this.displayArrayAccountOrders = this.displayArrayAccountOrdersSearch = setDisplayArrayAccountOrders(accountOrdersUsers,registeredStudents);
      this.pageLoaded = true;
    })
  }
  search(value: any): void {
    this.displayArrayAccountOrders = this.displayArrayAccountOrdersSearch.filter((val) => val.nameStudent.toLowerCase().includes(value.target.value.toLowerCase()))

  }
  setPage(number:number){
    this.page += number;
  }

  openDialogExport(){
    const dialogRef = this.dialog.open(ExportCsvDialogComponent, {
      width: '550px',
      data: {header: 'Exportieren', message: 'Bitte wählen Sie den Zeitraum aus den Sie exportieren möchten. Die Datei wird als CSV Datei heruntergeladen'},
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });

    dialogRef.afterClosed().subscribe((result:{firstDate:string,secondDate:string}) => {
      if (!result){
        this.submittingRequest = false;
        return;
      }
    });
  }
}
