import {Component, OnInit} from '@angular/core';
import {TenantStudentInterface} from "../../classes/tenant.class";
import {TenantServiceStudent} from "../../service/tenant.service";
import {Router} from "@angular/router";
import {UserService} from "../../service/user.service";
import {ToastrService} from "ngx-toastr";
import {forkJoin} from "rxjs";
import {GenerellService} from "../../service/generell.service";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {CustomerInterface} from "../../classes/customer.class";
import {WeekplanMenuInterface} from "../../classes/weekplan.interface";
import {MealModelInterface} from "../../classes/meal.interface";
import {MenuInterface} from "../../classes/menu.interface";
import {ArticleDeclarations} from "../../classes/allergenes.interface";
import {ArticleInterface} from "../../classes/article.interface";
import {StudentInterface} from "../../classes/student.class";
import {AssignedWeekplanInterface, WeekplanGroupClass} from "../../classes/assignedWeekplan.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {VacationsInterface} from "../../classes/vacation.interface";
import {emailNotValid} from "../../functions/generell.functions";

@Component({
  selector: 'app-register-tenant',
  templateUrl: './register-tenant.component.html',
  styleUrls: ['./register-tenant.component.scss']
})
export class RegisterTenantComponent implements OnInit {

  successFullSave:boolean = false;
  submittingRequest:boolean = false;
  customerModel: CustomerInterface | null = null;
  pageLoaded: boolean = false;  //Set true when all data is fetched

  tenantModel: TenantStudentInterface = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    orderSettings:{
      orderConfirmationEmail:false,
      sendReminderBalance:false,
      amountBalance:0,
      permanentOrder:false,
    }
  }

  constructor(private tenantServiceStudent: TenantServiceStudent,
              private generellService: GenerellService,
              private router:Router,
              private toastr: ToastrService,
              private userService: UserService) {

  }

  ngOnInit() {
    forkJoin([
      this.tenantServiceStudent.getTenantInformation(),
      this.generellService.getCustomerInfo()
    ]).subscribe({
      next: ([tenantStudent, customer]: [TenantStudentInterface, CustomerInterface]) => {
        if (tenantStudent) {
          this.router.navigateByUrl('/home/register_student');
        }
        this.customerModel = customer;
        this.pageLoaded = true;

        // Nested subscription should ideally be avoided here by chaining or other means
        this.userService.userProfile().subscribe({
          next: (response: any) => {
            this.tenantModel.email = response.user.email || ''; // safely accessing user email
          },
          error: (error) => {
            console.error('Error fetching user profile:', error);
            // Handle or display error for user profile fetching
          }
        });
      },
      error: (error) => {
        console.error('Error fetching tenant information or customer info:', error);
        this.router.navigateByUrl('/login');
      }
    });
  }
  setPersonalInformation():void {
    this.submittingRequest = true;
    if(emailNotValid(this.tenantModel.email)){
      this.toastr.error('Bitte geben Sie eine gültige E-Mail-Adresse ein','Fehler')
      this.submittingRequest = false
      return
    }
    this.tenantServiceStudent.addParentTenant(this.tenantModel).subscribe((response: any) => {
      console.log(response)
      if (!response.error) {
        this.submittingRequest = false
        this.toastr.success('Sie haben Ihre persönlichen Daten erfolgreich eingetragen', 'Erfolg')
        this.router.navigateByUrl('/home/register_student');
      }else{

        this.submittingRequest = false
      }
    })
  }

}
