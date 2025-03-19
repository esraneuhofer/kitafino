import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private notificationService: NotificationService) { }

  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiBaseUrl}/authenticate`, { email, password })
      .pipe(
        map(res => {
          // ...existing login success handling...
          
          // After successful login, initialize push notifications
          this.notificationService.initPush();
          
          return res;
        })
      );
  }

  // ...existing code...
}