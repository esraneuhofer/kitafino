import {Component, OnInit} from '@angular/core';
import {StudentService} from "../../service/student.service";
import {GenerellService} from "../../service/generell.service";
import {TenantServiceStudent} from "../../service/tenant.service";
import {UserService} from "../../service/user.service";
import {AccountService} from "../../service/account.serive";
import {OrderService} from "../../service/order.service";
import {PermanentOrderService} from "../../service/permant-order.service";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {setEmptyStudentModel, StudentInterface, StudentInterfaceSeed} from "../../classes/student.class";
import {CustomerInterface} from "../../classes/customer.class";
import {setOrderDayStudent} from "../order-student/order-container/order-container.component";
import {addDayFromDate} from "../order-student/order.functions";
import {getWeekplanModel} from "../../classes/weekplan.interface";
import {SettingInterfaceNew} from "../../classes/setting.class";

function createUsersArray() {
  let users:{email:string,projectId:string}[] = [];
  let projectId = [{name: 'mond1234', kids: 15}, {name: 'nach1234', kids: 25}, {name: 'mari1234', kids: 150}]
  projectId.forEach((projectId, indexProject) => {
    for (let i = 0; i < projectId.kids; i++) {
      users.push({
        email: `user_catering_${i}_${indexProject}.de`,
        projectId: projectId.name,
      })
    }
  })
  return users;
}
function createTenants(users: { email:string,_id:string,tenantId:string,customerId:string }[]): TenantStudentInterface[] {
  let tenants: TenantStudentInterface[] = [];

  users.forEach((user, index) => {
    let firstName = `FirstName_${index + 1}`;
    let lastName = `LastName_${index + 1}`;

    let tenant: TenantStudentInterface = {
      tenantId: user.tenantId,
      customerId: user.customerId,
      userId: user._id,
      firstAccess: true,
      firstAccessOrder: true,
      username: '',
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      phone: '',
      address: '',
      city: '',
      zip: '',
      orderSettings: {
        orderConfirmationEmail: true,
        sendReminderBalance: true,
        amountBalance: 15,
        permanentOrder: false,
        displayTypeOrderWeek: false
      }
    };

    tenants.push(tenant);
  });

  return tenants;
}
function generateRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateOrderStudents(settings:SettingInterfaceNew,customers:CustomerInterface[],student:StudentInterfaceSeed,indexDay:number){
  let customer = customers.find((eachCustomer)=>eachCustomer.customerId === student.customerId);
  if(!customer)return;
  let query = {week:25,year:2024}
  let weekplan = getWeekplanModel(settings, query)
  let order = setOrderDayStudent(null, weekplan, settings, customer, student, indexDay,
    new Date(addDayFromDate(new Date,0)), query, [false,false,false,false,false])
  let randomMenu = generateRandomInt(0, order.orderStudentModel.order.orderMenus - 1);
  order.orderStudentModel.order.orderMenus[randomMenu].amountOrder = 1
  order.orderStudentModel.order.orderMenus[randomMenu].menuSelected = true
  return order;
}

function createStudentsForTenants(tenants: TenantStudentInterface[], customer: CustomerInterface): StudentInterfaceSeed[] {
  let students: StudentInterfaceSeed[] = [];

  tenants.forEach((tenant) => {
    let numChildren = generateRandomInt(1, 100); // Random number between 1 and 100 for percentage calculation

    let numKids: number;
    if (numChildren <= 90) {
      numKids = 1;
    } else if (numChildren <= 98) {
      numKids = 2;
    } else {
      numKids = 3;
    }

    for (let i = 0; i < numKids; i++) {
      let firstName = `ChildFirstName_${i + 1}`;
      let lastName = `ChildLastName_${i + 1}`;
      let subgroupIndex = generateRandomInt(0, customer.order.split.length - 1);
      let subgroup = customer.order.split[subgroupIndex].group;
      let specialFood: string | null = null;

      let selectSpecialFood = generateRandomInt(1, 100); // Random number for special food selection
      if (selectSpecialFood <= 5 && customer.order.specialShow.length > 0) {
        let specialIndex = generateRandomInt(0, customer.order.specialShow.length - 1);
        specialFood = customer.order.specialShow[specialIndex].idSpecialFood;
      }

      let student: StudentInterfaceSeed = {
        firstName: '',
        lastName:'',
        username:'',
        customerId:'',
        subgroup:'',
        specialFood: null,
        userId:'',
        tenantId:'',
      }
      if(!tenant.userId || ! tenant.tenantId ||!tenant.customerId)return;

      student.firstName = firstName,
        student.lastName = lastName,
        student.subgroup = subgroup,
        student.specialFood = specialFood,
        student.userId = tenant.userId,
        student.tenantId =  tenant.tenantId,
        student.customerId =  tenant.customerId // Using tenant ID as customer ID for example

      students.push(student);
    }
  });
  return students;
}


@Component({
  selector: 'app-seed',
  templateUrl: './seed.component.html',
  styleUrls: ['./seed.component.scss']
})
export class SeedComponent implements OnInit {

  constructor(
    private studentService: StudentService,
    private generalService: GenerellService,
    private tenantService: TenantServiceStudent,
    public userService: UserService,
    private accountService: AccountService,
    private orderService: OrderService,
    private permanentOrdersService: PermanentOrderService,
  ) {
  }

  ngOnInit() {
  }


  seedUsers() {

  }
}
