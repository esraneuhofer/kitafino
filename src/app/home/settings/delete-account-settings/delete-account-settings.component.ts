import { Component, OnInit } from '@angular/core';
import { TenantStudentInterface } from "../../../classes/tenant.class";
import { AccountCustomerInterface } from "../../../classes/account.class";
import { PasswordNewInterface } from "../settings.component";
import { TenantServiceStudent } from "../../../service/tenant.service";
import { ToastrService } from "ngx-toastr";
import { UserService } from "../../../service/user.service";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AccountService } from "../../../service/account.serive";
import { TranslateService } from "@ngx-translate/core";
import { MessageDialogService } from "../../../service/message-dialog.service";
import { forkJoin, of } from "rxjs";
import { CloseAccountDialogComponent } from "../../../directives/close-account-dialog/close-account-dialog.component";
import { catchError } from "rxjs/operators";
import { OrderService } from '../../../service/order.service';
import { OrderInterfaceStudent } from '../../../classes/order_student.class';
import { OrderInterfaceStudentSave } from '../../../classes/order_student_safe.class';
import { StudentInterface } from '../../../classes/student.class';
import { StudentService } from '../../../service/student.service';

@Component({
  selector: 'app-delete-account-settings',
  templateUrl: './delete-account-settings.component.html',
  styleUrls: ['./delete-account-settings.component.scss']
})
export class DeleteAccountSettingsComponent implements OnInit {

  tenantModel!: TenantStudentInterface;
  submittingRequest = false;
  pageLoaded = false;
  accountTenant!: AccountCustomerInterface;
  submittingRequestDeletion = false;
  orderStudentFuture: OrderInterfaceStudentSave[] = [];
  students: StudentInterface[] = [];
  constructor(private tenantService: TenantServiceStudent,
    private studentService: StudentService,
    private orderService: OrderService,
    private userService: UserService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private router: Router,
    private accountService: AccountService,
    private translate: TranslateService,
    private messageService: MessageDialogService) {
  }
  ngOnInit() {
    forkJoin([
      this.tenantService.getTenantInformation(),
      this.accountService.getAccountTenant(),
      this.orderService.getFutureOrders(),
      this.studentService.getRegisteredStudentsUser(),
    ]).subscribe(
      ([
        tenantStudent,
        accountTenant,
        futureOrders,
        students
      ]: [
          TenantStudentInterface,
          AccountCustomerInterface,
          OrderInterfaceStudentSave[],
          StudentInterface[]
        ]) => {
        this.tenantModel = tenantStudent;
        this.orderStudentFuture = futureOrders;
        this.accountTenant = accountTenant;
        this.students = students;
        if (!this.tenantModel.orderSettings) {
          this.tenantModel.orderSettings = {
            orderConfirmationEmail: false,
            sendReminderBalance: false,
            amountBalance: 0,
            permanentOrder: false,
            displayTypeOrderWeek: false
          }
        }

        this.pageLoaded = true;
      })
  }

  closeAccount() {
    if (this.accountTenant.currentBalance > 0) {
      this.messageService.openMessageDialog(
        this.translate.instant('GELD_AUSZAHLEN_KONTO_SCHLIESSEN'),
        this.translate.instant('ERROR_TITLE'),
        'error'
      )
      return
    }
    if (this.orderStudentFuture.length > 0) {
      this.messageService.openMessageDialog(
        this.translate.instant('Sie haben noch Bestellungen in der Zukunft, bitte stornieren Sie diese bevor Sie Ihr Konto schließen.'),
        this.translate.instant('Bestellungen in der Zukunft'),
        'error'
      )
      return
    }
    this.submittingRequest = true;

    const dialogRef = this.dialog.open(CloseAccountDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      position: { top: '100px' },
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (!result) {
        this.submittingRequest = false;
      } else {
        this.submittingRequest = true;
        this.tenantModel.accountDeactivated = true;
        this.tenantModel.dateAccountDeactivated = new Date();
        this.accountTenant.accountDeactivated = true;
        this.accountTenant.dateAccountDeactivated = new Date();
        let promises = [
          this.userService.deactivateAccount(),
          this.tenantService.editParentTenant(this.tenantModel),
          this.accountService.editAccountTenant(this.accountTenant),
        ];
        this.students.forEach((student: StudentInterface) => {
          student.isActive = false;
          student.dateAccountDeactivated = new Date();
          promises.push(this.studentService.editStudent(student));
        })
        forkJoin(promises).pipe(

          catchError(err => {
            console.error('Error deactivating account:', err);
            // Display an error message to the user
            // Handle the error and stop further processing
            this.submittingRequest = false;
            return of(null); // Return a safe fallback value or an empty observable
          })
        ).subscribe((response) => {
          if (response && !response[0].error) {
            this.userService.deleteToken();
            this.toastr.success('Konto wurde erfolgreich geschlossen', 'Erfolg');
            this.router.navigate(['/login']);
          } else {
            // Handle failure response
            console.error('Failed to deactivate account:', response);
          }
          this.submittingRequest = false;
        });
      }
    })
  }
}
