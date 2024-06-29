import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';

import {forkJoin} from "rxjs";
import {UserService} from "../../service/user.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

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
  serverErrorMessages: (string | null) = null;
  errorMessageEmailInvalid: (string | null) = null;

  acceptUserTerms: boolean = false;
  submittingRequest: boolean = false;
  userModel = {email: '', projectId: ''};

  constructor(public userService: UserService, private toastr: ToastrService,
              private router: Router,
              private translate: TranslateService) {
  }

  ngOnInit() {
  }

  onSubmit(form: NgForm): void {
    this.submittingRequest = true;
    this.serverErrorMessages = null;
    this.errorMessageEmailInvalid = null;

    if (!validateEmail(form.value.email)) {
      this.translate.get('EMAIL_INVALID').subscribe((res: string) => {
        this.errorMessageEmailInvalid = res;
        this.toastr.error(res);
      });
      this.submittingRequest = false;
      return;
    }

    this.userService.addUser(form.value).subscribe({
      next: (response) => {
        this.submittingRequest = false;
        if (response.isError) {
          this.serverErrorMessages = this.translate.instant(response.message);
          this.toastr.error(this.translate.instant(response.message));
        } else {
          this.resetForm(form);
          this.toastr.success(this.translate.instant('REGISTRATION_SUCCESS'));
          this.router.navigateByUrl('/login');
        }
      },
      error: (error) => {
        this.submittingRequest = false;
        let errorMessage = this.translate.instant(error.error.message);
        this.toastr.error(errorMessage);
        this.serverErrorMessages = errorMessage

        // this.translate.get('UNEXPECTED_ERROR').subscribe((res: string) => {
        //   this.serverErrorMessages = error.error.message || res;
        //   const errorMessage = this.serverErrorMessages || 'Ein unbekannter Fehler ist aufgetreten';
        //   this.toastr.error(errorMessage);
        // });
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
