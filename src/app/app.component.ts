import { Component, HostListener, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { LanguageService } from './service/language.service';
import { ApiService } from './service/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isOnline: boolean = navigator.onLine;  // Initialer Online-Status basierend auf dem aktuellen Navigator-Status

  constructor(
    private platform: Platform,
    private languageService: LanguageService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.checkInitialNetworkStatus();
    this.initializeApp();
    console.log('App component initialized!');

    // API-Aufruf basierend auf dem initialen Netzwerkstatus
    if (this.isOnline) {
      this.apiService.setLanguage({ lang: 'en' }).subscribe(
        data => {
          console.log('Data received in component:', data);
        },
        error => {
          console.error('Error in component:', error);
        }
      );
    }
  }

  async initializeApp() {
    this.platform.ready().then(async () => {
      SplashScreen.hide();
    });
  }

  // Event Listener für Netzwerkstatus-Änderungen
  @HostListener('window:online', ['$event'])
  onOnline(event: Event) {
    this.isOnline = true;
    console.log('Online!');
    alert('Internetverbindung wieder hergestellt.');
    // Hier können weitere Aktionen hinzugefügt werden, wenn die App wieder online ist
  }

  @HostListener('window:offline', ['$event'])
  onOffline(event: Event) {
    this.isOnline = false;
    console.log('Offline!');
    alert('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.');
    // Hier können weitere Aktionen hinzugefügt werden, wenn die App offline geht
  }

  checkInitialNetworkStatus() {
    // Überprüft den initialen Netzwerkstatus beim Start der App
    if (!navigator.onLine) {
      this.isOnline = false;
      this.updateNetworkStatus();
    } else {
      this.isOnline = true;
      this.updateNetworkStatus();
    }
  }

  updateNetworkStatus() {
    if (this.isOnline) {
      console.log('The application is online.');
    } else {
      console.log('The application is offline.');
      alert('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.');
    }
  }

  switchLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }
}
