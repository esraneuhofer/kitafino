import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AccountChargeInterface, TransactionService} from "../../../service/transaction.service";
import {StudentService} from "../../../service/student.service";
import {forkJoin} from "rxjs";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {CustomerInterface} from "../../../classes/customer.class";
import {WeekplanMenuInterface} from "../../../classes/weekplan.interface";
import {MealModelInterface} from "../../../classes/meal.interface";
import {MenuInterface} from "../../../classes/menu.interface";
import {ArticleDeclarations} from "../../../classes/allergenes.interface";
import {ArticleInterface} from "../../../classes/article.interface";
import {StudentInterface} from "../../../classes/student.class";
import {TenantStudentInterface} from "../../../classes/tenant.class";
import {AssignedWeekplanInterface, WeekplanGroupClass} from "../../../classes/assignedWeekplan.class";
import {GenerellService} from "../../../service/generell.service";
import {ToastrService} from "ngx-toastr";
import {TenantServiceStudent} from "../../../service/tenant.service";
import {faClipboard, faShoppingCart} from "@fortawesome/free-solid-svg-icons";
import {ClipboardService} from "../../../service/clipboard.service";

const textBanner = 'Um Geld auf Ihr Konto aufzuladen, müssen Sie zuerst einen Schüler/in hinzufügen. Klicken Sie hier, um eine Schüler/in hinzuzufügen.';
@Component({
  selector: 'app-account-payment-overview',
  templateUrl: './account-payment-overview.component.html',
  styleUrls: ['./account-payment-overview.component.scss']
})
export class AccountPaymentOverviewComponent implements OnInit{
  protected readonly textBanner = textBanner;

  pageLoaded:boolean = false;
  submittingRequest = false;
  accountCharges:AccountChargeInterface[] = [];
  registeredStudents:StudentInterface[] = [];
  tenantStudent!:TenantStudentInterface;
  constructor(private transactionService:TransactionService,
              private clipboardService: ClipboardService,
              private generellService: GenerellService,
              private toastr: ToastrService,
              private tenantService: TenantServiceStudent,
              private studentService: StudentService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    forkJoin([
      this.generellService.getSettingsCaterer(),
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser(),
      this.tenantService.getTenantInformation(),
      this.transactionService.getTransactionTenant()
    ]).subscribe(
      ([
         settings,
         customer,
         students,
         tenantStudent,
        accountCharges
       ]: [
        SettingInterfaceNew,
        CustomerInterface,
        StudentInterface[],
        TenantStudentInterface,
        AccountChargeInterface[]
      ]) => {
        this.accountCharges = accountCharges;
        this.pageLoaded = true;
        this.tenantStudent = tenantStudent
        this.registeredStudents = students;
      })
  }
  copyToClipboard(text:string){
    this.clipboardService.copyToClipboard(text)
    this.toastr.success('Text kopiert');
  }
  protected readonly faShoppingCart = faShoppingCart;
  protected readonly faClipboard = faClipboard;
}
