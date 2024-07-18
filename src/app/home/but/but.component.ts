import {Component, OnInit} from '@angular/core';
import {StudentInterfaceId} from "../../classes/student.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {PermanentOrderClass, PermanentOrderInterface} from "../../classes/permanent-order.interface";
import {CustomerInterface} from "../../classes/customer.class";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {GenerellService} from "../../service/generell.service";
import {ToastrService} from "ngx-toastr";
import {TenantServiceStudent} from "../../service/tenant.service";
import {StudentService} from "../../service/student.service";
import {AccountService} from "../../service/account.serive";
import {PermanentOrderService} from "../../service/permant-order.service";
import {MessageDialogService} from "../../service/message-dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {dayArray} from "../../classes/weekplan.interface";
import {
  ConfirmDialogPermanetOrderComponent
} from "../permanent-orders/confirm-dialog-permanet-order/confirm-dialog-permanet-order.component";
import {ExportCsvDialogData} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import {forkJoin} from "rxjs";
import {getSplit} from "../order-student/order.functions";
import {getBestellfrist} from "../../functions/date.functions";

@Component({
  selector: 'app-but',
  templateUrl: './but.component.html',
  styleUrls: ['./but.component.scss']
})
export class ButComponent implements OnInit{

  bestellfrist:string = '';
  isFlipped:boolean = false;
  textBanner:string = '';
  dayArray = dayArray;
  submittingRequest = false;
  permanentOrderExists = false
  pageLoaded = false;
  selectedStudent: (StudentInterfaceId | null) = null;
  registeredStudents: StudentInterfaceId[] = [];
  subGroupsCustomer: string[] = []; //Subgroup
  accountTenant!: AccountCustomerInterface;
  permanentOrders: PermanentOrderInterface[] = []
  customer!: CustomerInterface;
  settings!: SettingInterfaceNew;
  tenantStudent!: TenantStudentInterface;
  selectedPermanentOrder: PermanentOrderInterface | null = null;

  constructor(private generellService: GenerellService,
              private toastr: ToastrService,
              private tenantService: TenantServiceStudent,
              private studentService: StudentService,
              private accountService: AccountService,
              private permanentOrdersService: PermanentOrderService,
              private messageService: MessageDialogService,
              private dialog: MatDialog,
              private translate: TranslateService) {
    this.textBanner = translate.instant("NO_STUDENT_REGISTERED_BANNER_TEXT")
  }


  ngOnInit() {
    forkJoin([
      this.generellService.getSettingsCaterer(),
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser(),
      this.tenantService.getTenantInformation(),
      this.accountService.getAccountTenant(),
    ]).subscribe(
      ([
         settings,
         customer,
         students,
         tenantStudent,
         accountTenant,
       ]: [
        SettingInterfaceNew,
        CustomerInterface,
        StudentInterfaceId[],
        TenantStudentInterface,
        AccountCustomerInterface,
      ]) => {
        this.settings = settings;
        this.customer = customer;
        this.customer.stateHol = 'HE' //Testing
        this.registeredStudents = students;
        this.subGroupsCustomer = getSplit(this.customer); //Gets customer splits
        this.tenantStudent = tenantStudent;
        this.accountTenant = accountTenant;
        this.bestellfrist = getBestellfrist(this.customer,this.translate)
        this.pageLoaded = true;

      },
      (error) => {
        console.error('An error occurred:', error);
        // Handle errors as needed.
      })
  }


  selectStudent(student: StudentInterfaceId | null) {
    this.submittingRequest = true;
    console.log(student)
    this.selectedStudent = student;
    if (!student) {
      return
    }

    setTimeout(() => this.isFlipped = true, 50);

    // const permanentOrder = this.permanentOrders.find((permanentOrder) => permanentOrder.studentId === student._id);
    // if (!permanentOrder) {
    //   this.permanentOrderExists = false
    //   this.selectedPermanentOrder = new PermanentOrderClass(this.accountTenant.userId, student._id, this.accountTenant.customerId);
    // } else {
    //   this.permanentOrderExists = true
    //   this.selectedPermanentOrder = permanentOrder;
    // }
    this.submittingRequest = false;

  }

  hasBut(student: StudentInterfaceId) {
    return false;
    // return this.permanentOrders.find((permanentOrder) => permanentOrder.studentId === student._id);
  }

  editOrAddBut(permanentOrder: PermanentOrderInterface) {
    this.submittingRequest = true;
    // if(noDayIsSelected(permanentOrder)){
    //   this.toastr.error(this.translate.instant('MANAGE_PERMANENT_ORDERS_ERROR_NO_DAY'))
    //   this.submittingRequest = false;
    //   return
    // }
    // const dialogRef = this.dialog.open(ConfirmDialogPermanetOrderComponent, {
    //   width: '550px',
    //   panelClass: 'custom-dialog-container',
    //   position: {top: '100px'}
    // });
    // dialogRef.afterClosed().subscribe((result:ExportCsvDialogData) => {
    //   if (!result){
    //     this.submittingRequest = false;
    //     return;
    //   }
    //   let routeId = permanentOrder._id ? 'editPermanentOrdersUser' : 'setPermanentOrdersUser';
    //   (this.permanentOrdersService as any)[routeId](permanentOrder).subscribe((response: any) => {
    //     if (!response.error) {
    //       this.submittingRequest = false;
    //       this.initAfterEdit()
    //     } else {
    //       this.toastr.error(this.translate.instant('MANAGE_PERMANENT_ORDERS_ERROR_SAVING'))
    //       this.submittingRequest = false
    //       this.isFlipped = false
    //     }
    //   });
    // });
  }

}
