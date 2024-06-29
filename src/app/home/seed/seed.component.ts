import {Component, OnInit} from '@angular/core';
import {StudentService} from "../../service/student.service";
import {GenerellService} from "../../service/generell.service";
import {TenantServiceStudent} from "../../service/tenant.service";
import {UserService} from "../../service/user.service";
import {AccountService} from "../../service/account.serive";
import {OrderService} from "../../service/order.service";
import {PermanentOrderService} from "../../service/permant-order.service";
import {TenantStudentInterface} from "../../classes/tenant.class";

// function createUsersArray() {
//   let users:{email:string,projectId:string}[] = [];
//   let projectId = [{name: 'mond1234', kids: 15}, {name: 'nach1234', kids: 25}, {name: 'mari1234', kids: 150}]
//   projectId.forEach((projectId, indexProject) => {
//     for (let i = 0; i < projectId.kids; i++) {
//       users.push({
//         email: `user_catering_${i}_${indexProject}.de`,
//         projectId: projectId.name,
//       })
//     }
//   })
//   return users;
// }
// function createTenants(users: { email:string,_id:string,tenantId:string,customerId:string }[]): TenantStudentInterface[] {
//   let tenants: TenantStudentInterface[] = [];
//
//   users.forEach((user, index) => {
//     let firstName = `FirstName_${index + 1}`;
//     let lastName = `LastName_${index + 1}`;
//
//     let tenant: TenantStudentInterface = {
//       tenantId: user.tenantId,
//       customerId: user.customerId,
//       userId: user._id,
//       firstAccess: true,
//       firstAccessOrder: true,
//       username: '',
//       firstName: firstName,
//       lastName: lastName,
//       email: user.email,
//       phone: '',
//       address: '',
//       city: '',
//       zip: '',
//       orderSettings: {
//         orderConfirmationEmail: true,
//         sendReminderBalance: true,
//         amountBalance: 15,
//         permanentOrder: false,
//         displayTypeOrderWeek: false
//       }
//     };
//
//     tenants.push(tenant);
//   });
//
//   return tenants;
// }


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
