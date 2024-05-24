import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TenantServiceStudent} from "../../service/tenant.service";
import {TenantStudentInterface} from "../../classes/tenant.class";

@Component({
  selector: 'app-first-access-dialog',
  templateUrl: './first-access-dialog.component.html',
  styleUrls: ['./first-access-dialog.component.scss']
})
export class FirstAccessDialogComponent {

  constructor(private tenantService: TenantServiceStudent,
              @Inject(MAT_DIALOG_DATA) public data:TenantStudentInterface,
              public dialogRef: MatDialogRef<FirstAccessDialogComponent>) {
  }

  closeFirstAccess(){
    const tenant = this.data;
    // tenant.firstAccess = false;
    this.tenantService.editParentTenant(tenant).subscribe((response)=>{
      this.dialogRef.close();
    })
  }

}
