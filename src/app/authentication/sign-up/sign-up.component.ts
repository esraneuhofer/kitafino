import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import {forkJoin} from "rxjs";
import {UserService} from "../../service/user.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
const validateEmail = (email:string) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  showSucessMessage: boolean = false;
  serverErrorMessages: (string | null) = null;
  errorMessageEmailInvalid: (string | null) = null;

  submittingRequest:boolean = false;
  userModel = {email: '', projectId:''};

  constructor(public userService: UserService, private toaster:ToastrService,
              private router : Router) { }

  ngOnInit() {
  }

  onSubmit(form : NgForm):void{
    this.submittingRequest = true;
    this.serverErrorMessages = null;
    if(!validateEmail(form.value.email)){
      this.errorMessageEmailInvalid = 'Bite geben Sie eine gültige Emailadresse an';
      this.submittingRequest = false;
      return
    }
    this.userService.addUser(form.value).subscribe(

      (res:any) => {
        console.log(res)
        if(res.message === 'Projekt wurde nicht gefunden'){
          this.submittingRequest = false;
          this.serverErrorMessages =res.message;
          return
        }
        this.resetForm(form);
        this.toaster.success("Der Account wurde angelegt");
        this.toaster.success("Eine Email mit Ihren Accountinfomrationen wurde an Ihre Emailadresse gesendet");
        this.router.navigateByUrl('home/dashboard');
        this.submittingRequest = false;
      },
      err => {
        console.log(err)

        this.submittingRequest = false
        this.serverErrorMessages = err.error.message;
      }
    );

  }

  resetForm(form: NgForm) {
    this.userModel = {
      email: '',
      projectId:'',
    };
    form.resetForm();
    this.serverErrorMessages = null;
    this.errorMessageEmailInvalid = null;
  }

}
