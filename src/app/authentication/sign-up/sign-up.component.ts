import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';

import {forkJoin} from "rxjs";
import {UserService} from "../../service/user.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";

const validateEmail = (email: string) => {
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

  submittingRequest: boolean = false;
  userModel = {email: '', projectId: ''};

  constructor(public userService: UserService, private toaster: ToastrService,
              private router: Router) {
  }

  ngOnInit() {
  }

  onSubmit(form: NgForm): void {
    this.submittingRequest = true;
    this.serverErrorMessages = null;

    if (!validateEmail(form.value.email)) {
      this.errorMessageEmailInvalid = 'Bitte geben Sie eine gültige Email Adresse an';
      this.submittingRequest = false;
      return;
    }

    this.userService.addUser(form.value).subscribe({
      next: (response) => {
        this.submittingRequest = false;
        if (response.isError) {
          this.serverErrorMessages = response.message;
          this.toaster.error(response.message);
        } else {
          this.resetForm(form);
          this.toaster.success("Der Account wurde angelegt");
          this.toaster.success("Eine Email mit Ihren Accountinformationen wurde an Ihre Email Adresse gesendet");
          this.router.navigateByUrl('/login');
        }
      },
      error: (error) => {
        this.submittingRequest = false;
        this.serverErrorMessages = error.error.message || 'Ein unerwarteter Fehler ist aufgetreten.';
        if(!this.serverErrorMessages)return;
        this.toaster.error(this.serverErrorMessages);
      }
    });
  }

  resetForm(form: NgForm) {
    this.userModel = {
      email: '',
      projectId: '',
    };
    form.resetForm();
    this.serverErrorMessages = null;
    this.errorMessageEmailInvalid = null;
  }

}
