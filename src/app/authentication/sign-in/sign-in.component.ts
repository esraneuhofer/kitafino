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
  serverErrorMessages: string | null = null;
  signInForm: FormGroup;

  constructor(private userService: UserService,
              private fb: FormBuilder,
              private router : Router) {
    this.signInForm = this.fb.group({
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required]]
    })
  }
  onSubmit() {
    if (this.signInForm.valid) {
      const formData = this.signInForm.value;
      this.userService.login(this.signInForm.value).subscribe(
        (res:any) => {
          this.userService.setToken(res['token']);
          this.router.navigateByUrl('register_student');
        },
        err => {
          this.serverErrorMessages = err.error.message;
        }
      );
    }
  }

  ngOnInit() {
    // if(this.userService.isLoggedIn())
    this.router.navigateByUrl('home/dashboard');
  }
}
