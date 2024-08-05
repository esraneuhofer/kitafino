// network.service.ts
import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  constructor(private router: Router) {
    this.initializeNetworkListener();
  }

  initializeNetworkListener() {
    Network.addListener('networkStatusChange', status => {
      if (!status.connected) {
        this.router.navigate(['/no-internet']);
      }
    });

    this.checkInitialNetworkStatus();
  }

  async checkInitialNetworkStatus() {
    const status = await Network.getStatus();
    console.log(status)
    if (!status.connected) {
      this.router.navigate(['/no-internet']);
    }
  }
}
