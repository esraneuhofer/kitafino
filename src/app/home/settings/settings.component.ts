import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {ToastrService} from "ngx-toastr";
import {isValidIBANNumber} from "../../functions/generell.functions";
import {MessageDialogService} from "../../service/message-dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {DialogErrorComponent} from "../../directives/dialog-error/dialog-error.component";
import {ExportCsvDialogData} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import {CloseAccountDialogComponent} from "../../directives/close-account-dialog/close-account-dialog.component";
import {UserService} from "../../service/user.service";
import {catchError} from "rxjs/operators";
import {forkJoin, of} from "rxjs";
import {SettingInterfaceNew} from "../../classes/setting.class";
import {CustomerInterface} from "../../classes/customer.class";
import {StudentInterfaceId} from "../../classes/student.class";
import {AccountCustomerInterface} from "../../classes/account.class";
import {PermanentOrderInterface} from "../../classes/permanent-order.interface";
import {AccountService} from "../../service/account.serive";

export interface PasswordNewInterface {
  oldPassword: string
  newPassword: string
  repeatNewPassword: string,
}
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  
}
