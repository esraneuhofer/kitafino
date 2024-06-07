import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { UserService } from "../../service/user.service";
import { StudentService } from "../../service/student.service";
import { LanguageService } from "../../service/language.service";
import { TranslateService } from "@ngx-translate/core";
import { MessageDialogService } from "../../service/message-dialog.service";
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import {Capacitor, Plugins} from '@capacitor/core';
import {SavePassword} from "capacitor-ios-autofill-save-password";
const { FingerprintAuth, Keychain,BiometricNative } = Plugins;


export function isApp(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor;

  // Überprüfen ob es sich um ein iOS Gerät handelt
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

  // Überprüfen ob es sich um ein Android Gerät handelt
  const isAndroid = /android/i.test(userAgent);

  // Überprüfen ob es sich um andere mobile Geräte handelt
  const isMobile = /Mobile|Tablet|iPad|iPhone|iPod|Android|Silk|Opera Mini|BlackBerry|IEMobile|Kindle/.test(userAgent);

  // Überprüfen ob es sich um ein Gerät mit einer mobilen Bildschirmgröße handelt
  const isSmallScreen = window.innerWidth <= 1024;

  return isIOS || isAndroid || isMobile || isSmallScreen;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  serverErrorMessages: (string | null) = null;
  signInModel = {
    email: '',
    password: ''
  }
  isMobileApp: boolean = false;
  isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  submittingRequest: boolean = false;

  constructor(private userService: UserService,
              private translate: TranslateService,
              private languageService: LanguageService,
              private renderer: Renderer2,
              private studentService: StudentService,
              private router: Router,
              private dialogService: MessageDialogService) { }

  ngOnInit() {
    this.isMobileApp = isApp();
    console.log(this.isMobileApp);

    if (this.isMobileApp) {
      this.checkBiometricAuth();
    }
  }

  async saveCredentials() {
    try {
      await Keychain['set']({ key: 'username', value: this.signInModel.email });
      await Keychain['set']({ key: 'password', value: this.signInModel.password });
      console.log('Credentials saved successfully');
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  }

  async retrieveCredentials() {
    try {
      const username = await Keychain['get']({ key: 'username' });
      const password = await Keychain['get']({ key: 'password' });
      if (username.value && password.value) {
        this.signInModel.email = username.value;
        this.signInModel.password = password.value;
      }
    } catch (error) {
      console.error('Error retrieving credentials:', error);
    }
  }
  async checkBiometricAuth() {
    if (!this.isMobileApp) return;

    try {
      const available = await FingerprintAuth['isAvailable']();
      if (available) {
        const result = await FingerprintAuth['verify']({
          reason: 'Log in with your biometrics',
          disableBackup: true,
        });
        if (result) {
          this.retrieveCredentials();
        }
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
    }
  }
  async promptBiometricAuth() {
    try {
      const available = await BiometricNative['isAvailable']();
      if (available) {
        await BiometricNative['show']({
          title: 'Log in',
          subtitle: 'Log in with your biometrics',
          disableBackup: true,
        });
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
    }
  }

  async onSubmit() {
    console.log(this.signInModel);
    this.submittingRequest = true;
    try {
      const res: any = await this.userService.login({ email: this.signInModel.email, password: this.signInModel.password }).toPromise();
      console.log(res);
      this.submittingRequest = false;
      // Save credentials after successful login
      if (Capacitor.getPlatform() === 'ios') {
        console.log('Saving credentials');
        try {
          await SavePassword['promptDialog']({
            username: this.signInModel.email,
            password: this.signInModel.password,
          });
          console.log('promptDialog success');
        } catch (err: any) {
          console.error('promptDialog failure', err);
          if (err && err.message) {
            console.error('Error message:', err.message);
          } else {
            console.error('Unknown error occurred');
          }
        }
      }
      this.userService.setToken(res['token']);
      this.studentService.getRegisteredStudentsUser().subscribe(students => {
        if (students.length === 0) {
          this.router.navigateByUrl('home/register_student');
        } else {
          this.router.navigateByUrl('home/dashboard');
        }
        this.submittingRequest = false;
      });
    } catch (err:any) {
      console.log(err);
      this.submittingRequest = false;
      this.serverErrorMessages = this.setMessage(err.error.message);
    }
  }


  setMessage(message: string): string {
    if (message === 'Wrong password') {
      return this.translate.instant('ERROR_WRONG_PASSWORD');
    }
    if (message === 'Email is not registered') {
      return this.translate.instant('ERROR_EMAIL_NOT_REGISTERED');
    }
    return message;
  }

  openHelp(): void {
    this.dialogService.openMessageDialog('Hilfe....', 'Hilfe', 'info');
  }

  switchLanguage(language: string): void {
    console.log(language);
    this.languageService.setLanguage(language);
  }
}
