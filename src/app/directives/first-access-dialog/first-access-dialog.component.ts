import {Component, Inject, NgZone} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TenantServiceStudent } from "../../service/tenant.service";
import { TenantStudentInterface } from "../../classes/tenant.class";
import { FormBuilder, FormGroup } from "@angular/forms";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-first-access-dialog',
  templateUrl: './first-access-dialog.component.html',
  styleUrls: ['./first-access-dialog.component.scss'],
})
export class FirstAccessDialogComponent {
  currentPage: number = 0;

  constructor(private tenantService: TenantServiceStudent,
              @Inject(MAT_DIALOG_DATA) public data: TenantStudentInterface,
              public dialogRef: MatDialogRef<FirstAccessDialogComponent>,
              private ngZone: NgZone) {

  }

  goToNextPage() {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.currentPage++;
        // this.ngZone.run(() => console.log(this.currentPage));
      });
    });
  }

  goToPreviousPage() {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.currentPage--;
      });
    });
  }

  closeFirstAccess() {
    const tenant = this.data;
    tenant.firstAccess = false;
    this.tenantService.editParentTenant(tenant).subscribe((response) => {
      this.dialogRef.close();
    });
  }
}
