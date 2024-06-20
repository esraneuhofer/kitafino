import {Component, Inject, Injectable} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CustomerInterface} from "../../classes/customer.class";
import {getBestellfrist} from "../../functions/date.functions";
import {TranslateService} from "@ngx-translate/core";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {TenantServiceStudent} from "../../service/tenant.service";

@Component({
  selector: 'app-first-access-order-dialog',
  templateUrl: './first-access-order-dialog.component.html',
  styleUrls: ['./first-access-order-dialog.component.scss']
})
export class FirstAccessOrderDialogComponent {
  bestellfrist:string = '';
  constructor(
    private tenantService: TenantServiceStudent,
    public dialogRef: MatDialogRef<FirstAccessOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data:{customer:CustomerInterface,
    tenant:TenantStudentInterface},private translate:TranslateService  ) {
    this.bestellfrist = getBestellfrist(data.customer,this.translate)
  }

  closeFirstAccess() {
    const tenant = this.data.tenant;
    this.data.tenant.firstAccessOrder = false;
    this.tenantService.editParentTenant(tenant).subscribe((response) => {
      console.log(response)
      this.dialogRef.close();
    });
  }
}
