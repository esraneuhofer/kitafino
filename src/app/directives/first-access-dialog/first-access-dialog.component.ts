import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TenantServiceStudent } from "../../service/tenant.service";
import { TenantStudentInterface } from "../../classes/tenant.class";
import { FormBuilder, FormGroup } from "@angular/forms";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-first-access-dialog',
  templateUrl: './first-access-dialog.component.html',
  styleUrls: ['./first-access-dialog.component.scss'],
  animations: [
    trigger('pageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class FirstAccessDialogComponent {
  currentPage: number = 0;
  step1: FormGroup;
  step2: FormGroup;
  step3: FormGroup;

  constructor(private tenantService: TenantServiceStudent,
              @Inject(MAT_DIALOG_DATA) public data: TenantStudentInterface,
              public dialogRef: MatDialogRef<FirstAccessDialogComponent>,
              private _formBuilder: FormBuilder) {
    this.step1 = this._formBuilder.group({});
    this.step2 = this._formBuilder.group({});
    this.step3 = this._formBuilder.group({});
  }

  goToNextPage() {
    this.currentPage++;
    console.log(this.currentPage);
  }

  goToPreviousPage() {
    this.currentPage--;
  }

  closeFirstAccess() {
    const tenant = this.data;
    tenant.firstAccess = false;
    this.tenantService.editParentTenant(tenant).subscribe((response) => {
      this.dialogRef.close();
    })
  }
}
