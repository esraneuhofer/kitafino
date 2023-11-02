import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

//   model ={
//     username:''
//   };
//   submittingRequest:boolean = false;
//   emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   serverErrorMessages: string;
//
//   constructor(public userService: UserService,private commonService:CommonService,
//               private toaster:ToastrService,
//               private router : Router) { }
//
  ngOnInit() {
  }
//
//   onSubmit(form : NgForm){
//     this.submittingRequest = true;
//     this.serverErrorMessages = null;
//     this.commonService.postObject('resetPassword',form.value).subscribe(
//       res => {
//         if(!res.message){
//           this.submittingRequest = false;
//           return this.serverErrorMessages ='Username konnte nicht gefunden werden';
//         }
//         this.model.username = '';
//         return this.toaster.success(res.message);
//
//         // this.resetForm(form);
//         // this.toaster.success("Eine Email mit Ihren neuen Passwort wurde an Ihre Emailadresse gesendet");
//         // this.router.navigateByUrl('home/dashboard');
//       },
//       err => {
//         this.submittingRequest = false;
//         this.serverErrorMessages = err.error.message;
//       }
//     );
//
//   }
// //
// // onSubmit(form: NgForm) {
// //     this.userService.postUser(form.value).subscribe((res:any )=>
// //        {
// //           this.showSucessMessage = true;
// //           setTimeout(() => this.showSucessMessage = false, 4000);
// //           this.resetForm(form);
// //       },
// //       err => {
// //         if (err.status === 422) {
// //           this.serverErrorMessages = err.error.join('<br/>');
// //         }
// //         else
// //           this.serverErrorMessages = 'Something went wrong.Please contact admin.';
// //       }
// //     );
// //   }
//
//   resetForm(form: NgForm) {
//     this.userService.selectedUser = {
//       fullName: '',
//       email: '',
//       password: '',
//       tenantUrl:'',
//       code:'',
//       contactPerson:''
//     };
//     form.resetForm();
//     this.serverErrorMessages = '';
//   }

}
