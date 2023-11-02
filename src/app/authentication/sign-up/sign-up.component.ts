import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import {forkJoin} from "rxjs";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  showSucessMessage: boolean = false;
  serverErrorMessages: string = ''

  constructor(public userService: UserService) { }

  ngOnInit() {
  }

  // onSubmit(form: NgForm) {
  //   this.userService.postUser(form.value).subscribe((res:any )=>
  //
  //      {
  //        if(res.message === 'Nice try'){
  //          return this.serverErrorMessages = 'Der eingegebene Code ist nicht korrekt';
  //        }
  //         this.showSucessMessage = true;
  //         setTimeout(() => this.showSucessMessage = false, 4000);
  //         this.resetForm(form);
  //     },
  //     err => {
  //       if (err.status === 422) {
  //         this.serverErrorMessages = err.error.join('<br/>');
  //       }
  //
  //       else
  //         this.serverErrorMessages = 'Something went wrong.Please contact admin.';
  //     }
  //   );
  // }

  // resetForm(form: NgForm) {
  //   this.userService.selectedUser = {
  //     fullName: '',
  //     email: '',
  //     password: '',
  //     tenantUrl:'',
  //     code:'',
  //     contactPerson:''
  //   };
  //   form.resetForm();
  //   this.serverErrorMessages = '';
  // }

}
