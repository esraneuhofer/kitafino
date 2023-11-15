import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import {UserService} from "../../service/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

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
              private fb: FormBuilder,
              private router: Router) {

  }

  onSubmit() {
    this.submittingRequest = true;
    this.userService.login({email:this.signInModel.email,password:this.signInModel.password}).subscribe(
      (res: any) => {
        console.log(res);
        this.submittingRequest = false;
        this.userService.setToken(res['token']);
        this.router.navigateByUrl('home/dashboard');
      },
      err => {
        console.log(err);

        this.submittingRequest = false;
        this.serverErrorMessages = err.error.message;
      })
}


  ngOnInit() {
    // if(this.userService.isLoggedIn())
    // this.router.navigateByUrl('home/dashboard');
  }
}
