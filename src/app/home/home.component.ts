
import {Component, HostListener, OnInit} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import {UserService} from "../service/user.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {LoadingService} from "../service/loading.service";
import {TenantServiceStudent} from "../service/tenant.service";
import {TenantStudentInterface} from "../classes/tenant.class";
import {filter, forkJoin} from "rxjs";
import {GenerellService} from "../service/generell.service";
import {StudentInterface} from "../classes/student.class";
import {OrdersAccountInterface} from "../classes/order_account.interface";
import {CustomerInterface} from "../classes/customer.class";
import {
  ExportCsvDialogComponent,
  ExportCsvDialogData
} from "../directives/export-csv-dialog/export-csv-dialog.component";
import {createXmlFile} from "./account/account-csv.function";
import {MatDialog} from "@angular/material/dialog";
import {HelpDialogComponent} from "../directives/help-dialog/help-dialog.component";
import {FirstAccessDialogComponent} from "../directives/first-access-dialog/first-access-dialog.component";

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
  customerInfo!:CustomerInterface;
  pageLoaded: boolean = false;
  currentRoute: string = '';

  handleRefresh(event:any) {
    console.log('Begin async operation');
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
      window.location.reload();
    }, 2000);
  }


  public selectLanguageWidth: string = '130px'
  updateSelectLanguageWidth(): void {
    const width = window.innerWidth;
    if (width <= 320) {
      this.selectLanguageWidth = '130px';
    } else if (width >= 351 && width <= 375) {
      this.selectLanguageWidth = '180px';
    } else {
      this.selectLanguageWidth = '210px';
    }
  }

  tenantInformation!:TenantStudentInterface;
  constructor(private userService:UserService,
              private dialog: MatDialog,
              private generalService:GenerellService,
              private activatedRoute: ActivatedRoute,
              private router:Router, private tenantService:TenantServiceStudent) {
    this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
    });

  }
  openHelp(){
    const dialogRef = this.dialog.open(HelpDialogComponent, {
      width: '600px',
      data: {route: this.currentRoute},
      panelClass: 'custom-dialog-container',
      position: {top: '20px'}
    });
  }
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateSelectLanguageWidth();
  }
  ngOnInit() {
    this.updateSelectLanguageWidth();
    forkJoin(
      this.tenantService.getTenantInformation(),
      this.generalService.getCustomerInfo()
    ).subscribe(
      (
        [tenant,customer]:
          [TenantStudentInterface,CustomerInterface])=>{
      if (!tenant){
        this.router.navigate(['/home/tenant']);
      } else {
        this.customerInfo = customer;
        this.tenantInformation = tenant;
        this.pageLoaded = true;
        if(this.tenantInformation.firstAccess){
          const dialogRef = this.dialog.open(FirstAccessDialogComponent, {
            width: '600px',
            data: this.tenantInformation,
            panelClass: 'custom-dialog-container',
            position: {top: '20px'}
          });
        }
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

