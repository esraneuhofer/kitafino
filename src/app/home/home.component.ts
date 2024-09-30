
import {Component, HostListener, OnInit} from '@angular/core';
import {trigger, transition, style, animate, state} from '@angular/animations';
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
import {NotificationService} from "../service/notification.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('submenu', [
      state('void', style({
        opacity: 0,
        height: '0px',
        overflow: 'hidden'
      })),
      state('*', style({
        opacity: 1,
        height: '*'
      })),
      transition('void <=> *', [
        animate('300ms ease-in-out')
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
  isSubmenuOpen = false;

  customerInfo:CustomerInterface | undefined;
  pageLoaded: boolean = false;
  currentRoute: string = '';

  handleRefresh(event: any) {

    this.loadData().then(() => {
      event.target.complete();
      window.location.reload();
      // this.router.navigate([this.router.url]); // Navigiere zur aktuellen URL, um die Komponente neu zu laden
    });
  }

  // Methode zum Laden der Daten (ersetze dies mit deiner tatsächlichen Datenlade-Logik)
  async loadData() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  // handleRefresh(event:any) {
  //   console.log('Begin async operation');
  //   setTimeout(() => {
  //     // Any calls to load data go here
  //     event.target.complete();
  //     window.location.reload();
  //   }, 2000);
  // }


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
              private notificationService: NotificationService,
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
  // ngOnInit() {
  //   this.updateSelectLanguageWidth();
  //   forkJoin(
  //     this.tenantService.getTenantInformation(),
  //     this.generalService.getCustomerInfo()
  //   ).subscribe(
  //     (
  //       [tenant,customer]:
  //         [TenantStudentInterface,CustomerInterface])=>{
  //     if (!tenant){
  //       this.router.navigate(['/home/tenant']);
  //     } else {
  //       this.customerInfo = customer;
  //       this.tenantInformation = tenant;
  //       this.pageLoaded = true;
  //       if(this.tenantInformation.firstAccess){
  //         const dialogRef = this.dialog.open(FirstAccessDialogComponent, {
  //           width: '600px',
  //           data: this.tenantInformation,
  //           panelClass: 'custom-dialog-container',
  //           position: {top: '20px'}
  //         });
  //       }
  //     }
  //   })
  // }
  ngOnInit() {
    this.updateSelectLanguageWidth();
    forkJoin(
      this.tenantService.getTenantInformation(),
      this.generalService.getCustomerInfo()
    ).subscribe(
      async ([tenant, customer]: [TenantStudentInterface, CustomerInterface]) => {
        if (!tenant) {
          this.router.navigate(['/home/tenant']);
        } else {
          this.customerInfo = customer;
          this.tenantInformation = tenant;
          this.pageLoaded = true;
          console.log('Tenant information:', this.tenantInformation);
          if (this.tenantInformation.firstAccess) {
            const dialogRef = this.dialog.open(FirstAccessDialogComponent, {
              width: '600px',
              data: this.tenantInformation,
              panelClass: 'custom-dialog-container',
              position: { top: '20px' }
            });
          }

          // // Push-Benachrichtigungen initialisieren nach dem Einloggen
          // try {
          //   await this.notificationService.initPush();
          //   console.log('Push-Benachrichtigungen erfolgreich initialisiert.');
          // } catch (error) {
          //   console.error('Fehler bei der Initialisierung der Push-Benachrichtigungen:', error);
          // }
        }
      }
    );
  }

  logout(){
    this.userService.deleteToken();
    this.router.navigate(['/login']);
  }
  // toggleOffCanvasMenu(){
  //   this.isOffCanvasMenu = !this.isOffCanvasMenu;
  //
  //   if (this.isOffCanvasMenuDialog){
  //     setTimeout(() => {
  //       this.isOffCanvasMenuDialog = !this.isOffCanvasMenuDialog;
  //     },400)
  //   } else {
  //     this.isOffCanvasMenuDialog = !this.isOffCanvasMenuDialog;
  //   }
  // }
  toggleOffCanvasMenu() {
    this.isOffCanvasMenu = !this.isOffCanvasMenu;

    if (this.isOffCanvasMenuDialog) {
      setTimeout(() => {
        this.isOffCanvasMenuDialog = !this.isOffCanvasMenuDialog;
      }, 400);
    } else {
      this.isOffCanvasMenuDialog = !this.isOffCanvasMenuDialog;
    }
  }

  toggleSubmenu(event: MouseEvent) {
    event.stopPropagation();
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }
}

// dashboard
//order_student
//but
//help -> weg
//feedback -> weg
//messages -> weg
