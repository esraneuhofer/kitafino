import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { UserService } from "../../service/user.service";
import { StudentService } from "../../service/student.service";
import { LanguageService } from "../../service/language.service";
import { TranslateService } from "@ngx-translate/core";
import { MessageDialogService } from "../../service/message-dialog.service";
import {Capacitor} from "@capacitor/core";
import { SavePassword } from 'capacitor-ios-autofill-save-password';

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
    this.isMobileApp = Capacitor.isNativePlatform();
    // console.log(this.isMobileApp);
    //
    // if (this.isMobileApp) {
    //   this.checkBiometricAuth();
    // }
  }
  async saveCredentials() {
    if (Capacitor.getPlatform() === 'ios') {
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
  }


  async onSubmit() {
    this.submittingRequest = true;
    this.userService.login({ email: this.signInModel.email, password: this.signInModel.password }).subscribe(
      async (res: any) => {
        this.submittingRequest = false;
        this.userService.setToken(res['token']);
        this.studentService.getRegisteredStudentsUser().subscribe(students => {
          // if (students.length === 0) {
          //   this.router.navigateByUrl('home/register_student');
          // } else {
          //   this.router.navigateByUrl('home/dashboard');
          // }
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

  openHelp(): void {
    this.dialogService.openMessageDialog('Hilfe....', 'Hilfe', 'info');
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
