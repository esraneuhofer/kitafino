// src/app/app.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiService } from './service/api.service';
import { NetworkService } from './service/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private networkSubscription?: Subscription;
  private previousStatus: boolean | null = null; // Variable zum Verfolgen des vorherigen Status

  constructor(
    private platform: Platform,
    private apiService: ApiService,
    private networkService: NetworkService,
    private toastr: ToastrService,
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();

    // Weitere Initialisierungen können hier stattfinden
  }

  async ngOnInit() {

    try {
      // Überprüfung der Backend-Verbindung und Setzen der Sprache
      await this.setLanguage('de');

      // Weitere Initialisierungen können hier hinzugefügt werden
    } catch (error) {
      console.error('Fehler bei der Initialisierung der App:', error);
      // Optional: Zeigen Sie eine Fehlermeldung an oder führen Sie andere Fehlerbehandlungen durch
    } finally {
      // Verstecken Sie den Splash Screen, unabhängig vom Erfolg der Initialisierung
      SplashScreen.hide();
    }

    // Abonnieren des Netzwerkstatus
    this.networkSubscription = this.networkService.getNetworkStatus().subscribe(
      (isOnline) => {
        console.log('Netzwerkstatus in der Komponente:', isOnline);

        if (this.previousStatus === null) {
          // Initialer Status beim Start der App, keine Meldung anzeigen
          this.previousStatus = isOnline;
          return;
        }

        if (!this.previousStatus && isOnline) {
          // Wechsel von Offline zu Online
          this.toastr.success('Sie sind wieder online.', 'Online', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true,
          });
        } else if (this.previousStatus && !isOnline) {
          // Wechsel von Online zu Offline
          this.toastr.error(
            'Sie sind offline. Einige Funktionen sind möglicherweise nicht verfügbar.',
            'Offline',
            {
              timeOut: 3000,
              closeButton: true,
              progressBar: true,
            }
          );
        }

        // Aktualisieren des vorherigen Status
        this.previousStatus = isOnline;
      }
    );

  }

  ngOnDestroy() {
    // Sicherstellen, dass das Abonnement beendet wird, um Speicherlecks zu vermeiden
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }

  // Methode zum Setzen der Sprache
  async setLanguage(lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.setLanguage({ lang }).subscribe(
        (data) => {
          console.log('Sprache erfolgreich gesetzt:', data);
          resolve();
        },
        (error) => {
          console.error('Fehler beim Setzen der Sprache:', error);
          reject(error);
        }
      );
    });
  }

}
