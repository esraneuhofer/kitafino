import { Injectable } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {DialogErrorComponent} from "../directives/dialog-error/dialog-error.component";

@Injectable({
  providedIn: 'root'
})
export class MessageDialogService {
  constructor(private dialog: MatDialog) {}

  openMessageDialog(message: string,header: string): void {
    const sanitizedMessage = message;
    this.dialog.open(DialogErrorComponent, {
      width: '400px',
      data: { header, message: sanitizedMessage },
      panelClass: 'custom-dialog-container',
      position: { top: '100px' },
    });
  }

}
