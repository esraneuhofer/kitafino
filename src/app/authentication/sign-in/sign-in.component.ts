import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import { Router } from "@angular/router";
import {UserService} from "../../service/user.service";
import {StudentService} from "../../service/student.service";
import {InstallPromptService} from "../../service/intstall-prompt.service";

function setMessage(message:string):string{
  if(message === 'Wrong password')return 'Das Passwort stimmt nicht mit der Email Adresse überein'
  if(message === 'Email is not registered')return 'Die Email Adresse konnte nicht gefunden werden'
  return message;
}
// import '@khmyznikov/pwa-install';


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
  isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  submittingRequest: boolean = false;
  // @ViewChild('pwaInstallComponent') pwaInstallComponent!: ElementRef;
  // @ViewChild('pwaInstallComponent') pwaInstallElementRef: ElementRef;
  constructor(private userService: UserService,
              private renderer: Renderer2,
              private studentService: StudentService,
              private router: Router,
              private installPromptService: InstallPromptService) {

  }

  onSubmit() {
    console.log(this.signInModel);
    this.submittingRequest = true;
    this.userService.login({email:this.signInModel.email,password:this.signInModel.password}).subscribe(
      (res: any) => {
        console.log(res);
        this.submittingRequest = false;

        this.userService.setToken(res['token']);
        this.studentService.getRegisteredStudentsUser().subscribe(students =>{
          if(students.length === 0){
            this.router.navigateByUrl('home/register_student');
          }else{
            this.router.navigateByUrl('home/dashboard');
          }
          this.submittingRequest = false;
        })



      },
      err => {
        console.log(err);

        this.submittingRequest = false;
        this.serverErrorMessages = setMessage(err.error.message);
      })
  }
  shouldShow(): boolean {
    return !!this.installPromptService.getInstallPromptEvent();
  }

  promptInstall(): void {
    this.installPromptService.promptUser();
  }

  promptInstallSafari() {
    // const pwaInstallElement = this.pwaInstallComponent.nativeElement as any;
    // console.log('Element:', pwaInstallElement);
    // console.log('showDialog method:', pwaInstallElement.showDialog);
    //
    // if (pwaInstallElement && pwaInstallElement.showDialog) {
    //   pwaInstallElement.showDialog(true);
    // } else {
    //   console.error('showDialog method is not available on PWA Install Component');
    // }
  }
  ngOnInit() {


    console.log("this.userService.isLoggedIn())");
    // if(this.userService.isLoggedIn())
    // this.router.navigateByUrl('home/dashboard');
  }
}
