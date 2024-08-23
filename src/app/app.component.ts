import { Component, OnInit } from '@angular/core';
import { LanguageService } from "./service/language.service";
import { ApiService } from "./service/api.service";
import { environment } from "../environments/environment";
import { ToastingService } from "./service/toastr.service";
import { SplashScreen } from '@capacitor/splash-screen';
import {Platform} from "@ionic/angular";
import {Network} from "@capacitor/network";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private toastrService: ToastingService,
              private platform: Platform,
              private languageService: LanguageService,
              private apiService: ApiService) {
    // console.log(`Environment API Base URL: ${environment.apiBaseUrl}`);  // Log the environment variable directly
  }

  switchLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }

  ngOnInit() {
    // this.initializeApp();
    this.apiService.setLanguage({ lang: 'en' }).subscribe(
      data => {
        // console.log('Data received in component:', data);
      },
      error => {
        // console.error('Error in component:', error);
      }
    );
  }

  // async initializeApp() {
  //   this.platform.ready().then(async () => {
  //     await this.checkNetworkStatus();
  //   });
  // }
  //
  // async checkNetworkStatus() {
  //   const status = await Network.getStatus();
  //
  //   if (!status.connected) {
  //     this.showNoNetworkAlert();
  //   }
  //
  //   // Event Listener für Netzwerkstatus-Änderungen hinzufügen
  //   Network.addListener('networkStatusChange', (status) => {
  //     if (!status.connected) {
  //       this.showNoNetworkAlert();
  //     } else {
  //       this.hideNetworkAlert();
  //     }
  //   });
  //
  //   SplashScreen.hide(); // Splashscreen ausblenden, nachdem die Netzwerküberprüfung abgeschlossen ist
  // }
  //
  // showNoNetworkAlert() {
  //   alert('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.');
  //   // Hier kannst du auch eine benutzerdefinierte Anzeige oder ein Modal öffnen
  // }
  //
  // hideNetworkAlert() {
  //   // Logik zum Schließen der Netzwerk-Warnung oder eines Modals, falls erforderlich
  // }



}
