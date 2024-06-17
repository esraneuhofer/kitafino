import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  isIos: boolean;
  isAndroid: boolean;
  isWeb: boolean;

  constructor() {
    this.isIos = Capacitor.getPlatform() === 'ios';
    this.isAndroid = Capacitor.getPlatform() === 'android';
    this.isWeb = Capacitor.getPlatform() === 'web';
  }
}
