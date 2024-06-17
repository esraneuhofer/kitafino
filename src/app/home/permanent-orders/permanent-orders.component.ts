import {Component, OnInit} from '@angular/core';
import {StudentInterface, StudentInterfaceId} from "../../classes/student.class";
import {GenerellService} from "../../service/generell.service";
import {ToastrService} from "ngx-toastr";
import {TenantServiceStudent} from "../../service/tenant.service";
import {StudentService} from "../../service/student.service";
import {AccountService} from "../../service/account.serive";
import {ActivatedRoute, Router} from "@angular/router";
import {forkJoin} from "rxjs";
import {SettingInterfaceNew, SpecialOrderSettings} from "../../classes/setting.class";
import {CustomerInterface} from "../../classes/customer.class";
import {dayArray} from "../../classes/weekplan.interface";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {getSplit} from "../order-student/order.functions";
import {PermanentOrderService} from "../../service/permant-order.service";
import {
  PermanentOrderClass,
  PermanentOrderInterface
} from "../../classes/permanent-order.interface";
import {customerHasSpecialFood} from "../../functions/special-food.functions";
import {TranslateService} from "@ngx-translate/core";
import {MessageService} from "../../service/message.service";
import {MessageDialogService} from "../../service/message-dialog.service";
import {MatDialog} from "@angular/material/dialog";
import {
  ExportCsvDialogComponent,
  ExportCsvDialogData
} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import {createXmlFile} from "../account/account-csv.function";
import {
  ConfirmDialogPermanetOrderComponent
} from "./confirm-dialog-permanet-order/confirm-dialog-permanet-order.component";
import {getBestellfrist} from "../../functions/date.functions";

interface DaysOrderPermanentInterfaceSelection {
  selected: boolean,
  menuId: string,
  typeSpecial: string,
  nameMenu: string
}

function noDayIsSelected(permanentOrder: PermanentOrderInterface):boolean{
  let selected = true
    permanentOrder.daysOrder.forEach((day) => {
        if(day.selected){
            selected = false
        }
    })
    return selected
}
function getFirstMenuSettings(settings: SettingInterfaceNew): string {
  for (let i = 0; i < settings.orderSettings.specials.length; i++) {
    if (settings.orderSettings.specials[i].typeOrder === 'menu') {
      return settings.orderSettings.specials[i]._id
    }
  }
  return ''
}

function getMenuSelectionPermanentOrder(settings: SettingInterfaceNew, customer: CustomerInterface,student:StudentInterfaceId): DaysOrderPermanentInterfaceSelection[] {
  let arrayMenu: DaysOrderPermanentInterfaceSelection[] = []
  settings.orderSettings.specials.forEach((special) => {
    if (special.typeOrder === 'menu') {
      arrayMenu.push({selected: false, menuId: special._id, typeSpecial: 'menu', nameMenu: special.nameSpecial})
    }
  })
  settings.orderSettings.specialFoods.forEach((special) => {
    if (customerHasSpecialFood(customer, special._id) && student.specialFood === special._id) {
      arrayMenu.push({selected: false, menuId: special._id, typeSpecial: 'special', nameMenu: special.nameSpecialFood})
    }
  })
  return arrayMenu

}

@Component({
  selector: 'app-permanent-orders',
  templateUrl: './permanent-orders.component.html',
  styleUrls: ['./permanent-orders.component.scss']
})
export class PermanentOrdersComponent implements OnInit {

  bestellfrist:string = '';
  isFlipped:boolean = false;
  textBanner:string = '';
  dayArray = dayArray;
  submittingRequest = false;
  menuSelection: DaysOrderPermanentInterfaceSelection[] = [];
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

  initAfterEdit() {
    this.permanentOrdersService.getPermanentOrdersUser().subscribe((permanentOrders: PermanentOrderInterface[]) => {
      this.permanentOrders = permanentOrders;
      const selectedStudent = this.selectedStudent;
      if(selectedStudent){
        const permanentOrder = this.permanentOrders.find((permanentOrder) => permanentOrder.studentId === selectedStudent._id);
        if(!permanentOrder)return
        this.selectedPermanentOrder = permanentOrder
        this.permanentOrderExists = true
      }
      this.toastr.success(this.translate.instant('MANAGE_PERMANENT_ORDERS_SUCCESS_EDIT'));
      this.isFlipped = false;
      this.submittingRequest = false;
    });
  }

  ngOnInit() {
    forkJoin([
      this.generellService.getSettingsCaterer(),
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser(),
      this.tenantService.getTenantInformation(),
      this.accountService.getAccountTenant(),
      this.permanentOrdersService.getPermanentOrdersUser(),
    ]).subscribe(
      ([
         settings,
         customer,
         students,
         tenantStudent,
         accountTenant,
         permanentOrders
       ]: [
        SettingInterfaceNew,
        CustomerInterface,
        StudentInterfaceId[],
        TenantStudentInterface,
        AccountCustomerInterface,
        PermanentOrderInterface[]
      ]) => {
        this.settings = settings;
        this.customer = customer;
        this.customer.stateHol = 'HE' //Testing
        this.registeredStudents = students;
        this.subGroupsCustomer = getSplit(this.customer); //Gets customer splits
        this.tenantStudent = tenantStudent;
        this.accountTenant = accountTenant;
        this.permanentOrders = permanentOrders;
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
    this.selectedStudent = student;
    if (!student) {
      this.selectedPermanentOrder = null;
      return
    }
    this.menuSelection = getMenuSelectionPermanentOrder(this.settings, this.customer,student)

    setTimeout(() => this.isFlipped = true, 50);
    const permanentOrder = this.permanentOrders.find((permanentOrder) => permanentOrder.studentId === student._id);
    if (!permanentOrder) {
      this.permanentOrderExists = false
      this.selectedPermanentOrder = new PermanentOrderClass(this.accountTenant.userId, student._id, this.accountTenant.customerId);
    } else {
      this.permanentOrderExists = true
      this.selectedPermanentOrder = permanentOrder;
    }
    this.submittingRequest = false;

  }

  editOrAddPermanentOrders(permanentOrder: PermanentOrderInterface) {
    this.submittingRequest = true;
    if(noDayIsSelected(permanentOrder)){
        this.toastr.error(this.translate.instant('MANAGE_PERMANENT_ORDERS_ERROR_NO_DAY'))
        this.submittingRequest = false;
        return
    }
    const dialogRef = this.dialog.open(ConfirmDialogPermanetOrderComponent, {
      width: '550px',
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });
    dialogRef.afterClosed().subscribe((result:ExportCsvDialogData) => {
      if (!result){
        this.submittingRequest = false;
        return;
      }
      let routeId = permanentOrder._id ? 'editPermanentOrdersUser' : 'setPermanentOrdersUser';
      (this.permanentOrdersService as any)[routeId](permanentOrder).subscribe((response: any) => {
        if (!response.error) {
          this.submittingRequest = false;
          this.initAfterEdit()
        } else {
          this.toastr.error(this.translate.instant('MANAGE_PERMANENT_ORDERS_ERROR_SAVING'))
          this.submittingRequest = false
          this.isFlipped = false
        }
      });
    });
  }

  hasDauerbestellung(student: StudentInterfaceId) {
    return this.permanentOrders.find((permanentOrder) => permanentOrder.studentId === student._id);
  }

  setLinePermanentOrder(event: boolean, indexLine: number) {

    if (!this.selectedPermanentOrder) return

    if (event) {
      let menuId = getFirstMenuSettings(this.settings)
      let typeSpecial = this.menuSelection.find((menu) => menu.menuId === menuId)
      if(!typeSpecial)return
      this.selectedPermanentOrder.daysOrder[indexLine].menuId = menuId
      this.selectedPermanentOrder.daysOrder[indexLine].typeSpecial = typeSpecial.typeSpecial;
    }else{
      this.selectedPermanentOrder.daysOrder[indexLine].menuId = ''
      this.selectedPermanentOrder.daysOrder[indexLine].typeSpecial = ''
    }
  }
  back(){
    this.isFlipped = false
  }
  deletePermanentOrder(permanentOrder: PermanentOrderInterface) {
    this.submittingRequest = true;
    this.permanentOrdersService.deletePermanentOrdersUser(permanentOrder).subscribe((response: any) => {
      if (!response.error) {
        this.submittingRequest = false;
        this.selectedStudent = null;
        this.initAfterEdit()
      } else {
        this.toastr.error(this.translate.instant("MANAGE_PERMANENT_ORDERS_ERROR_DELETING"))
        this.submittingRequest = false
        this.isFlipped = false

      }
    });
  }

  setPermanentOrderType(event: string, indexLine: number) {
    if (!this.selectedPermanentOrder) return
    let typeSpecial = this.menuSelection.find((menu) => menu.menuId === event)
    if(!typeSpecial)return
    this.selectedPermanentOrder.daysOrder[indexLine].typeSpecial = typeSpecial.typeSpecial;
  }

}
