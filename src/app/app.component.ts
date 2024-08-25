import {Component, HostListener, OnInit} from '@angular/core';
import { LanguageService } from "./service/language.service";
import { ApiService } from "./service/api.service";
import { environment } from "../environments/environment";
import { ToastingService } from "./service/toastr.service";
import { SplashScreen } from '@capacitor/splash-screen';
import {Platform} from "@ionic/angular";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  networkListener: any
  isOnline: boolean = navigator.onLine;

  constructor(private toastr: ToastingService,
              private platform: Platform,
              private languageService: LanguageService,
              private apiService: ApiService) {
    // console.log(`Environment API Base URL: ${environment.apiBaseUrl}`);  // Log the environment variable directly
  }

  switchLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }


  // Event Listener für Netzwerkstatus-Änderungen
  @HostListener('window:online', ['$event'])
  onOnline(event: Event) {
    this.isOnline = true;
    console.log('Online!');
    alert('Internetverbindung wieder hergestellt.');
    // Handle going online
  }

  @HostListener('window:offline', ['$event'])
  onOffline(event: Event) {
    this.isOnline = false;
    console.log('Offline!');
    alert('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.');
    // Handle going offline
  }

  updateNetworkStatus() {
    if (this.isOnline) {
      console.log('The application is online.');
    } else {
      console.log('The application is offline.');
      alert('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.');
    }
  }
  ngOnInit() {
    this.updateNetworkStatus();
    this.initializeApp();
    console.log('App component initialized!');
    this.apiService.setLanguage({ lang: 'en' }).subscribe(
      data => {
        // console.log('Data received in component:', data);
      },
      error => {
        // console.error('Error in component:', error);
      }
    );
  }

  async initializeApp() {

    this.platform.ready().then(async () => {
      SplashScreen.hide();
    });
  }


}
