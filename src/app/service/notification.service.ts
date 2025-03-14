import {Injectable} from '@angular/core';
import {PushNotifications, Token, PermissionStatus, PushNotificationSchema} from '@capacitor/push-notifications';
import {Preferences} from '@capacitor/preferences';
import {environment} from "../../environments/environment";
import {map} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AlertController} from "@ionic/angular";
import {Badge} from "@capawesome/capacitor-badge";
import {Capacitor} from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private permissionKey = 'push_permission';
  private deviceIdKey = 'device_unique_id';
  private deviceId: string | null = null;
  private platform: string | null = null;

  constructor(private http: HttpClient,
              private alertController: AlertController) {
    // Get device information as early as possible
    this.initDeviceInfo();
  }

  private async initDeviceInfo() {
    try {
      // Set platform based on Capacitor.getPlatform() which is already available
      this.platform = Capacitor.getPlatform();
      
      // Try to get a stored device ID from preferences
      const storedDeviceId = await Preferences.get({ key: this.deviceIdKey });
      
      if (storedDeviceId && storedDeviceId.value) {
        this.deviceId = storedDeviceId.value;
      } else {
        // Generate a new unique device ID if none exists
        this.deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        await Preferences.set({ key: this.deviceIdKey, value: this.deviceId });
      }
      
      console.log('Using device ID:', this.deviceId, 'Platform:', this.platform);
    } catch (error) {
      console.error('Error initializing device info:', error);
      // Fallback device ID generation
      this.deviceId = 'fallback_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      this.platform = Capacitor.getPlatform();
      try {
        await Preferences.set({ key: this.deviceIdKey, value: this.deviceId });
      } catch (e) {
        console.error('Error saving fallback device ID:', e);
      }
    }
  }

  saveTokenFirebase(object: { token: string }) {
    // Include device info with the token if available
    const payload = { token: object.token };
    
    if (this.deviceId) {
      // New format with device info
      Object.assign(payload, {
        deviceId: this.deviceId,
        platform: this.platform
      });
    }
    
    return this.http.post(environment.apiBaseUrl + '/saveTokenFirebase', payload)
      .pipe(map((response: any) => response));
  }

  deleteSpecificToken(token: string) {
    // Include device ID when deleting token if available
    const payload = { token };
    console.log('deleteSpecificToken wurde aufgerufen:',token);
    if (this.deviceId) {
      Object.assign(payload, { deviceId: this.deviceId });
    }
    
    return this.http.post(environment.apiBaseUrl + '/deleteSpecificTokenFirebase', payload)
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

  async initPush() {
    // Make sure device info is initialized
    if (!this.deviceId) {
      await this.initDeviceInfo();
    }
    
    // Check permission status
    const permissionStatus: PermissionStatus = await PushNotifications.checkPermissions();
    console.log('initPush wurde aufgerufen - Zeitstempel:', new Date().toISOString());
    
    if (permissionStatus.receive === 'granted') {
      await this.registerPush();
    } else if (permissionStatus.receive === 'denied') {
      const tokenToDelete = await this.getStoredToken();
      if (tokenToDelete) {
        await this.deleteSpecificToken(tokenToDelete);
      }
    } else if (permissionStatus.receive === 'prompt') {
      await this.requestPermission();
    }

    await this.resetBadgeCount();
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
    // Ensure device info is available
    if (!this.deviceId) {
      await this.initDeviceInfo();
    }

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
      console.log(token)
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
