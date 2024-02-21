import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import {UserService} from "../../service/user.service";
import {StudentService} from "../../service/student.service";

function setMessage(message:string):string{
  if(message === 'Wrong password')return 'Das Passwort stimmt nicht mit der Email Adresse überein'
  if(message === 'Email is not registered')return 'Die Email Adresse konnte nicht gefunden werden'
  return message;
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
  submittingRequest: boolean = false;

  constructor(private userService: UserService,
              private studentService: StudentService,
              private router: Router) {

  }

  onSubmit() {
    console.log(this.signInModel);
    this.submittingRequest = true;
    this.userService.login({email:this.signInModel.email,password:this.signInModel.password}).subscribe(
      (res: any) => {
        console.log(res);

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


  ngOnInit() {
    console.log("this.userService.isLoggedIn())");
    // if(this.userService.isLoggedIn())
    // this.router.navigateByUrl('home/dashboard');
  }

}
