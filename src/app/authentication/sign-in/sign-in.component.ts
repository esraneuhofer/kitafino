import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { UserService } from "../../service/user.service";
import { StudentService } from "../../service/student.service";
import { LanguageService } from "../../service/language.service";
import { TranslateService } from "@ngx-translate/core";
import { MessageDialogService } from "../../service/message-dialog.service";
import {Capacitor} from "@capacitor/core";
import { SavePassword } from 'capacitor-ios-autofill-save-password';
import {HelpDialogComponent} from "../../directives/help-dialog/help-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {KeychainAccess, SecureStorage} from '@aparajita/capacitor-secure-storage';
import {AlertController} from "@ionic/angular";

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
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  passwordVisible: boolean = false;
  isMobileApp: boolean = false;
  isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  submittingRequest: boolean = false;

  constructor(private userService: UserService,
              private translate: TranslateService,
              private languageService: LanguageService,
              private renderer: Renderer2,
              private alertController: AlertController,
              private studentService: StudentService,
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.isMobileApp = Capacitor.isNativePlatform();
    if(Capacitor.getPlatform() === 'android'){
      this.checkStoredCredentials();
    }
    // console.log(this.isMobileApp);
    //
    // if (this.isMobileApp) {
    //   this.checkBiometricAuth();
    // }
  }

  async checkStoredCredentials() {
    try {
      const email = await SecureStorage.get( 'username' );
      const password = await SecureStorage.get('password');

      if (email && password) {
        this.signInModel.email = email as string;
        this.signInModel.password = password as string;
        console.log('Stored credentials found and pre-filled.');
      } else {
        console.log('No stored credentials found.');
      }
    } catch (error) {
      console.error('Failed to retrieve stored credentials:', error);
    }
  }

  async saveCredentials() {
    console.log('Platform:', Capacitor.getPlatform());

    if (Capacitor.getPlatform() === 'ios') {
      console.log('Saving credentials');
      try {
        await SavePassword.promptDialog({
          username: this.signInModel.email,
          password: this.signInModel.password
        });
        console.log('Credentials saved successfully');
      } catch (error) {
        console.error('Failed to save credentials:', error);
      }
    }
    else if (Capacitor.getPlatform() === 'android') {
      console.log('Checking if credentials need to be saved or updated');

      try {
        const storedEmail = await SecureStorage.get('username' ) as string | null;
        const storedPassword = await SecureStorage.get('password' ) as string | null;

        if (!storedEmail || !storedPassword) {
          // Falls keine Anmeldedaten gespeichert sind, frage, ob sie gespeichert werden sollen
          const alert = await this.alertController.create({
            header: 'Passwort speichern?',
            message: 'Möchten Sie das Passwort für zukünftige Anmeldungen speichern?',
            buttons: [
              {
                text: 'Nein',
                role: 'cancel',
                handler: () => {
                  console.log('User declined to save credentials');
                }
              },
              {
                text: 'Ja',
                handler: async () => {
                  try {
                    await SecureStorage.set('username', this.signInModel.email, false, true);
                    await SecureStorage.set('password', this.signInModel.password, false, true);
                    console.log('Credentials saved successfully on Android');
                  } catch (error) {
                    console.error('Failed to save credentials on Android:', error);
                  }
                }
              }
            ]
          });
          await alert.present();

        } else if (storedPassword !== this.signInModel.password) {
          // Falls das Passwort anders ist, frage, ob es aktualisiert werden soll
          const updateAlert = await this.alertController.create({
            header: 'Passwort aktualisieren?',
            message: 'Das gespeicherte Passwort ist anders. Möchten Sie es aktualisieren?',
            buttons: [
              {
                text: 'Nein',
                role: 'cancel',
                handler: () => {
                  console.log('User declined to update credentials');
                }
              },
              {
                text: 'Ja',
                handler: async () => {
                  try {
                    await SecureStorage.set('username', this.signInModel.email, false, true);
                    await SecureStorage.set('password', this.signInModel.password, false, true);
                    console.log('Credentials updated successfully on Android');
                  } catch (error) {
                    console.error('Failed to update credentials on Android:', error);
                  }
                }
              }
            ]
          });
          await updateAlert.present();
        } else {
          console.log('Credentials are already saved and unchanged.');
        }
      } catch (error) {
        console.error('Failed to check or save credentials:', error);
      }
    }
  }



  async onSubmit() {
    this.submittingRequest = true;
    console.log('Saving credentials');
    this.userService.login({ email: this.signInModel.email, password: this.signInModel.password }).subscribe(

      async (res: any) => {
        console.log(res);
        this.submittingRequest = false;
        this.userService.setToken(res['token']);
        this.studentService.getRegisteredStudentsUser().subscribe(students => {
          if (students.length === 0) {
            this.router.navigateByUrl('home/register_student');
          } else {
            this.router.navigateByUrl('home/dashboard');
          }
          this.submittingRequest = false;
        });

        // Save credentials after successful login
        await this.saveCredentials();
      },
      err => {
        this.submittingRequest = false;
        this.serverErrorMessages = this.setMessage(err.error.message);
      }
    );
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

  openHelp(){
    const dialogRef = this.dialog.open(HelpDialogComponent, {
      width: '600px',
      data: {route: 'login'},
      panelClass: 'custom-dialog-container',
      position: {top: '20px'}
    });
  }

  switchLanguage(language: string): void {
    // console.log(language);
    this.languageService.setLanguage(language);
  }

  // async presentSavePasswordAlert() {
  //   console.log('Presenting save password alert');
  //   setTimeout(async () => {
  //     const alert = await this.alertController.create({
  //       header: 'Passwort speichern?',
  //       message: 'Möchten Sie das Passwort für zukünftige Anmeldungen speichern?',
  //       buttons: [
  //         {
  //           text: 'Nein',
  //           role: 'cancel',
  //           cssClass: 'secondary',
  //         }, {
  //           text: 'Ja',
  //           handler: async () => {
  //             console.log('User chose to save the password');
  //             await SecureStoragePlugin.set({ key: 'user-password', value: this.signInModel.password });
  //             await SecureStoragePlugin.set({ key: 'username', value: this.signInModel.email });
  //           }
  //         }
  //       ]
  //     });
  //     await alert.present();
  //   }, 500);  // Wartezeit von 500ms
  // }
}
