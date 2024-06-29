import {Component, OnInit} from '@angular/core';
import {StudentService} from "../../service/student.service";
import {GenerellService} from "../../service/generell.service";
import {TenantServiceStudent} from "../../service/tenant.service";
import {UserService} from "../../service/user.service";
import {AccountService} from "../../service/account.serive";
import {OrderService} from "../../service/order.service";
import {PermanentOrderService} from "../../service/permant-order.service";

// function createUsersArray(){
//   const users = [];
//   for (let i = 0; i < 10; i++) {
//     users.push({
//       email:
//       }
//
// let seedUser = [
//   {
//     projectId:'',
//     emails:[
//
//     ]
//   }
// ]

@Component({
  selector: 'app-seed',
  templateUrl: './seed.component.html',
  styleUrls: ['./seed.component.scss']
})
export class SeedComponent implements OnInit{

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


  seedUsers(){

  }
}
