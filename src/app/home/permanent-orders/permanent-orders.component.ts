import {Component, OnInit} from '@angular/core';
import {StudentInterfaceId} from "../../classes/student.class";
import {GenerellService} from "../../service/generell.service";
import {ToastrService} from "ngx-toastr";
import {TenantServiceStudent} from "../../service/tenant.service";
import {StudentService} from "../../service/student.service";
import {AccountService} from "../../service/account.serive";
import {ActivatedRoute, Router} from "@angular/router";
import {forkJoin} from "rxjs";
import {SettingInterfaceNew} from "../../classes/setting.class";
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

interface DaysOrderPermanentInterfaceSelection {
  selected: boolean,
  menuId: string,
  typeSpecial: string,
  nameMenu: string
}

function getFirstMenuSettings(settings: SettingInterfaceNew): string {
  for (let i = 0; i < settings.orderSettings.specials.length; i++) {
    if (settings.orderSettings.specials[i].typeOrder === 'menu') {
      return settings.orderSettings.specials[i]._id
    }
  }
  return ''
}

function getMenuSelectionPermanentOrder(settings: SettingInterfaceNew, customer: CustomerInterface): DaysOrderPermanentInterfaceSelection[] {
  let arrayMenu: DaysOrderPermanentInterfaceSelection[] = []
  settings.orderSettings.specials.forEach((special) => {
    if (special.typeOrder === 'menu') {
      arrayMenu.push({selected: false, menuId: special._id, typeSpecial: 'menu', nameMenu: special.nameSpecial})
    }
  })
  settings.orderSettings.specialFoods.forEach((special) => {
    if (customerHasSpecialFood(customer, special._id)) {
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


  isFlipped:boolean = false;

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
              private router: Router,
              private r: ActivatedRoute) {
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
      this.toastr.success('Dauerbestellung erfolgreich bearbeitet');
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
        this.pageLoaded = true;
        this.menuSelection = getMenuSelectionPermanentOrder(this.settings, this.customer)
      },
      (error) => {
        console.error('An error occurred:', error);
        // Handle errors as needed.
      })
  }

  selectStudent(student: StudentInterfaceId | null) {
    console.log(student)
    this.submittingRequest = true;
    this.selectedStudent = student;
    if (!student) {
      this.selectedPermanentOrder = null;
      return
    }
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
    let routeId = permanentOrder._id ? 'editPermanentOrdersUser' : 'setPermanentOrdersUser';
    (this.permanentOrdersService as any)[routeId](permanentOrder).subscribe((response: any) => {
      if (!response.error) {
        this.submittingRequest = false;
        this.initAfterEdit()
      } else {
        this.toastr.error('Fehler beim Speichern der Dauerbestellung')
        this.submittingRequest = false
        this.isFlipped = false
      }
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
        this.toastr.error('Fehler beim Löschen der Dauerbestellung')
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
    console.log(typeSpecial.typeSpecial)
  }

}
