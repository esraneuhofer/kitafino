import {Injectable} from '@angular/core';
import {PushNotifications, Token, PermissionStatus, PushNotificationSchema} from '@capacitor/push-notifications';
import {Preferences} from '@capacitor/preferences';
import {environment} from "../../environments/environment";
import {map} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AlertController} from "@ionic/angular";
import {Badge} from "@capawesome/capacitor-badge"; // Aktualisiert von Storage zu Preferences

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private permissionKey = 'push_permission';

  constructor(private http: HttpClient,
              private alertController: AlertController) {

  }


  saveTokenFirebase(object: { token: string }) {
    return this.http.post(environment.apiBaseUrl + '/saveTokenFirebase', object)
      .pipe(map((response: any) => response));
  }

  deleteSpecificToken(token: string) {
    return this.http.post(environment.apiBaseUrl + '/deleteSpecificTokenFirebase', { token })
      .pipe(map((response: any) => response))
      .subscribe(
        (response) => {
          console.log('Token erfolgreich gelöscht:', response);
        },
        (error) => {
          console.error('Fehler beim Löschen des Tokens:', error);
        }
      );
  }
  // async initPush() {
  //   const storedPermission = await this.getStoredPermission();
  //
  //   if (storedPermission === null) {
  //     // Keine Entscheidung getroffen, Berechtigung anfragen
  //     await this.requestPermission();
  //   } else if (storedPermission === 'granted') {
  //     // Bereits erlaubt, Registrierung durchführen
  //     await this.registerPush();
  //   } else {
  //     // Bereits abgelehnt, nichts tun
  //     console.log('Push-Benachrichtigungen wurden vom Benutzer abgelehnt.');
  //   }
  //   await this.resetBadgeCount();
  // }

  async initPush() {
    // Überprüfung des aktuellen Berechtigungsstatus
    const permissionStatus: PermissionStatus = await PushNotifications.checkPermissions();
    console.log('initPush wurde aufgerufen - Zeitstempel:', new Date().toISOString());
    if (permissionStatus.receive === 'granted') {
      await this.registerPush(); // Registrierung nur durchführen, wenn kein Token vorhanden ist
    } else if (permissionStatus.receive === 'denied') {
      const tokenToDelete = await this.getStoredToken();  // Du solltest den gespeicherten Token abrufen
      if (tokenToDelete) {

        await this.deleteSpecificToken(tokenToDelete);
      }
    } else if (permissionStatus.receive === 'prompt') {
      // Dies tritt nur auf, wenn der Benutzer die Berechtigung noch nie gewährt oder abgelehnt hat
      await this.requestPermission(); // Nur wenn die Berechtigung noch nie angefragt wurde
    }

    await this.resetBadgeCount(); // Badge-Count nach Berechtigungsprüfung zurücksetzen
  }


  private async resetBadgeCount() {
    try {
      await Badge.set({ count: 0 });
    } catch (error) {
      console.error('Fehler beim Zurücksetzen des Badge-Zählers:', error);
    }
  }

  private async requestPermission() {
    let permissionStatus: PermissionStatus = await PushNotifications.checkPermissions();

    if (permissionStatus.receive === 'prompt') {
      permissionStatus = await PushNotifications.requestPermissions();
      await this.storePermission(permissionStatus.receive);
    } else {
      await this.storePermission(permissionStatus.receive);
    }

    if (permissionStatus.receive === 'granted') {
      await this.registerPush();
    } else {
      // console.log('Push-Benachrichtigungen wurden nicht erlaubt.');
    }
  }
  private isRegistered = false;
  private async registerPush() {

    // Entferne alle bestehenden Listener, bevor neue registriert werden
    await PushNotifications.removeAllListeners();
    console.log('Alle Push-Benachrichtigungs-Listener entfernt');

    if (this.isRegistered) {
      console.log('Push-Benachrichtigungen sind bereits registriert.');
      return;
    }

    // Setze das Flag direkt auf true
    this.isRegistered = true;

    console.log('registerPush aufgerufen');

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token: Token) => {
      await Preferences.set({ key: 'push_token', value: token.value });
      this.saveTokenFirebase({ token: token.value }).subscribe(data => {
        console.log('Token gespeichert:', data);
      });
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Fehler bei der Registrierung: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      console.log('Benachrichtigung erhalten - Zeitstempel:', new Date().toISOString(), ' - Notification:', notification);
      await this.presentAlert(notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Benachrichtigungsaktion ausgeführt:', notification);
    });

    console.log('registerPush abgeschlossen');
  }



  private async storePermission(status: string) {
    await Preferences.set({
      key: this.permissionKey,
      value: status,
    });
  }

  private async getStoredPermission(): Promise<string | null> {
    const {value} = await Preferences.get({key: this.permissionKey});
    return value;
  }
  private async getStoredToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'push_token' });
    return value;
  }
  private async presentAlert(notification: PushNotificationSchema) {
    const alert = await this.alertController.create({
      header: notification.title || 'Benachrichtigung',
      message: notification.body || '',
      buttons: ['OK']
    });

    await alert.present();
  }
}
