// src/app/services/network.service.ts

import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { Platform } from '@ionic/angular';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private platform: Platform) {
    this.initializeNetworkEvents();
  }

  private async initializeNetworkEvents() {
    if (this.platform.is('hybrid')) {
      // Mobile Plattform (Android oder iOS)
      const status = await Network.getStatus();
      this.updateNetworkStatus(status.connected);

      Network.addListener('networkStatusChange', (status) => {
        this.updateNetworkStatus(status.connected);
      });
    } else {
      // Web Plattform
      this.updateNetworkStatus(navigator.onLine);

      fromEvent(window, 'online').subscribe(() => {
        this.updateNetworkStatus(true);
      });
      fromEvent(window, 'offline').subscribe(() => {
        this.updateNetworkStatus(false);
      });
    }
  }

  private updateNetworkStatus(isOnline: boolean) {
    console.log('Netzwerkstatus geändert:', isOnline);
    this.status.next(isOnline);
  }

  public getNetworkStatus(): Observable<boolean> {
    return this.status.asObservable().pipe(distinctUntilChanged());
  }
}
