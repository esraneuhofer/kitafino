
import {Component, OnInit} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import {UserService} from "../service/user.service";
import {Router} from "@angular/router";
import {LoadingService} from "../service/loading.service";
import {TenantServiceStudent} from "../service/tenant.service";
import {TenantStudentInterface} from "../classes/tenant.class";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('opacity', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease', style({  opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('300ms ease', style({ opacity: 0 }))
      ])
    ]),
    trigger('opacityTranslateX', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in-out', style({  transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)' }),
        animate('300ms ease-in-out', style({ transform: 'translateX(-100%)' }))
      ])
    ]),
    trigger('opacityInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in-out', style({  opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('300ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit{

  isOffCanvasMenu = false;
  isOffCanvasMenuDialog = false;

  pageLoaded: boolean = false;

  tenantInformation!:TenantStudentInterface;
  constructor(private userService:UserService, private router:Router, private tenantService:TenantServiceStudent) {

  }

  ngOnInit() {
    this.pageLoaded = false;

    this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
      if (!tenant){
        this.router.navigate(['/home/tenant']);
      } else {
        this.tenantInformation = tenant;
        this.pageLoaded = true;
      }
    })
  }

  logout(){
    this.userService.deleteToken();
    this.router.navigate(['/login']);
  }
  toggleOffCanvasMenu(){
    this.isOffCanvasMenu = !this.isOffCanvasMenu;

    if (this.isOffCanvasMenuDialog){
      setTimeout(() => {
        this.isOffCanvasMenuDialog = !this.isOffCanvasMenuDialog;
      },400)
    } else {
      this.isOffCanvasMenuDialog = !this.isOffCanvasMenuDialog;
    }
  }
}

