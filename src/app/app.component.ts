// import {Component, HostListener, OnInit} from '@angular/core';
// import { LanguageService } from "./service/language.service";
// import { ApiService } from "./service/api.service";
// import { environment } from "../environments/environment";
// import { ToastingService } from "./service/toastr.service";
// import { SplashScreen } from '@capacitor/splash-screen';
// import {Platform} from "@ionic/angular";
//
// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent implements OnInit {
//
//   networkListener: any
//   isOnline: boolean = navigator.onLine;
//
//   constructor(private toastr: ToastingService,
//               private platform: Platform,
//               private languageService: LanguageService,
//               private apiService: ApiService) {
//     // console.log(`Environment API Base URL: ${environment.apiBaseUrl}`);  // Log the environment variable directly
//   }
//
//   switchLanguage(language: string): void {
//     this.languageService.setLanguage(language);
//   }
//
//
//   // Event Listener für Netzwerkstatus-Änderungen
//   @HostListener('window:online', ['$event'])
//   onOnline(event: Event) {
//     this.isOnline = true;
//     console.log('Online!');
//     alert('Internetverbindung wieder hergestellt.');
//     // Handle going online
//   }
//
//   @HostListener('window:offline', ['$event'])
//   onOffline(event: Event) {
//     this.isOnline = false;
//     console.log('Offline!');
//     alert('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.');
//     // Handle going offline
//   }
//
//   updateNetworkStatus() {
//     if (this.isOnline) {
//       console.log('The application is online.');
//     } else {
//       console.log('The application is offline.');
//       alert('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.');
//     }
//   }
//   ngOnInit() {
//
//     this.initializeApp();
//     console.log('App component initialized!');
//     this.apiService.setLanguage({ lang: 'en' }).subscribe(
//       data => {
//         // console.log('Data received in component:', data);
//       },
//       error => {
//         // console.error('Error in component:', error);
//       }
//     );
//   }
//
//   async initializeApp() {
//
//     this.platform.ready().then(async () => {
//       SplashScreen.hide();
//       this.updateNetworkStatus();
//     });
//   }
//
//
// }
import { Component, OnInit, NgZone } from '@angular/core';
import { LanguageService } from "./service/language.service";
import { ApiService } from "./service/api.service";
import { ToastingService } from "./service/toastr.service";
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from "@ionic/angular";
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isOnline: boolean = false; // Initial auf 'false' setzen

  constructor(
    private toastr: ToastingService,
    private platform: Platform,
    private languageService: LanguageService,
    private apiService: ApiService,
    private ngZone: NgZone // NgZone importieren und im Konstruktor verwenden
  ) { }

  ngOnInit() {
    this.initializeApp();
    this.apiService.setLanguage({ lang: 'en' }).subscribe(
      data => {
        // Logik bei erfolgreicher Sprachänderung
      },
      error => {
        // Fehlerbehandlung
      }
    );

    // Netzwerkstatus-Listener einrichten mit NgZone
    Network.addListener('networkStatusChange', (status) => {
      this.ngZone.run(() => {
        this.isOnline = status.connected;
        this.updateNetworkStatus(); // UI-Änderungen im Angular-Kontext ausführen
      });
    });
  }

  async initializeApp() {
    await this.platform.ready();
    SplashScreen.hide();

    // Überprüfung des Netzwerkstatus beim Start
    this.checkInitialNetworkStatus();
  }

  checkInitialNetworkStatus() {
    // Hier die Netzwerkkonnektivität überprüfen und entsprechend handeln
    Network.getStatus().then((status) => {
      this.ngZone.run(() => {
        this.isOnline = status.connected;
        this.updateNetworkStatus();
      });
    });
  }

  updateNetworkStatus() {
    if (this.isOnline) {
      console.log('The application is online.');
      alert('Internetverbindung wieder hergestellt.');
    } else {
      console.log('The application is offline.');
      alert('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.');
    }
  }
}
