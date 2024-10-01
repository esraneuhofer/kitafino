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
              private studentService: StudentService,
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.isMobileApp = Capacitor.isNativePlatform();
    // console.log(this.isMobileApp);
    //
    // if (this.isMobileApp) {
    //   this.checkBiometricAuth();
    // }
  }
  async saveCredentials() {
    if (Capacitor.getPlatform() === 'ios' ||  Capacitor.getPlatform() === 'android') {
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


}
