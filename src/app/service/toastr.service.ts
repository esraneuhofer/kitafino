import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastrMessage {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastingService {
  private toastrSubject = new Subject<ToastrMessage>();
  toastrState = this.toastrSubject.asObservable();

  show(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    this.toastrSubject.next({ title, message, type });
  }
}
