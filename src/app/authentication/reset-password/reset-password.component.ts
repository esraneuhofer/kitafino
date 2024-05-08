import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from "../../service/user.service";
import {ToastrService} from "ngx-toastr";
import {J} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  submittingRequest:boolean = false;
  username:string = '';
  serverErrorMessages:string | null = null;
  constructor(public userService: UserService,
              private toaster:ToastrService,
              private router : Router) { }

  ngOnInit() {
  }
//
  onSubmit(form : NgForm):void{
    this.submittingRequest = true;
    this.serverErrorMessages = null;
    const username = JSON.parse(JSON.stringify(this.username))
    this.userService.resetPassword(this.username).subscribe(
      res => {
        if(!res.message){
          this.submittingRequest = false;
          this.serverErrorMessages =`Username: ${username} konnte nicht gefunden werden`;
        }else{
          this.serverErrorMessages =`Passwort erfolgreich zurück gesetzt und an die hinterlegte Email Adresse: ${username} gesendet`;
          this.username = '';
          this.router.navigateByUrl('login');
          // this.toaster.success('Passwort erfolgreich zurück gesetzt');
        }
      },
      err => {
        this.submittingRequest = false;
        this.serverErrorMessages = err.error.message;
      }
    );

  }
  redirectLogin(){
    this.router.navigateByUrl('login');

  }
}
