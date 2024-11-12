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
    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      // console.log('Push registration success, token: ' + token.value);
      this.saveTokenFirebase({token: token.value}).subscribe(data => {
        console.log(data);
      });
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      // console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', async(notification) => {
      // console.log('Push received: ', notification);
      await this.presentAlert(notification);
      // Hier können Sie eine Benachrichtigung anzeigen oder verarbeiten
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      // console.log('Push action performed: ', notification);
      // Verarbeiten Sie die Aktion, die der Benutzer durchgeführt hat
    });
    this.isRegistered = true;
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
    console.log('Gespeicherter Token:', value);
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
