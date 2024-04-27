// install-prompt.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InstallPromptService {
  private promptEvent: any;

  constructor() {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault(); // Verhindert das automatische Anzeigen des Aufforderungsbanners
      this.promptEvent = event;
    });
  }

  getInstallPromptEvent() {
    return this.promptEvent;
  }

  promptUser() {
    console.log('Prompting user to install the app');
    if (this.promptEvent) {
      this.promptEvent.prompt(); // Zeigt das Installationsbanner an
      this.promptEvent.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        this.promptEvent = null; // Löscht das Ereignis nach der Verarbeitung
      });
    }
  }
}
