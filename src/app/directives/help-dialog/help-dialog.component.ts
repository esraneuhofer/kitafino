import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {isWidthToSmall} from "../../home/order-student/order-container/order-container.component";
import {TranslateService} from "@ngx-translate/core";
import {LanguageService} from "../../service/language.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HelpPdfInterface, HelpService} from "../../service/help.service";
import {downloadPdfHelpIos, downloadPdfIos} from "../../home/weekplan-pdf/download-ios.function";
import {downloadPdfWeb} from "../../home/weekplan-pdf/download-web.function";
import {PlatformService} from "../../service/platform.service";
import {FileOpener} from "@ionic-native/file-opener/ngx";
import {forkJoin} from "rxjs";
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";

function getSegmentDouble(segment: string): string {
  if(segment === 'settings_personal'
    || segment === 'settings_order' ||
    segment === 'settings_password' ||
    segment === 'settings_delete_account') {
    return 'settings';
  }
  return segment;
}
interface HelpText {
  header: string;
  contentSmall: string[];
  contentRegular: string[];
}

export function getLastSegment(route: string): string {
  const segments = route.split('/');
  return getSegmentDouble(segments[segments.length - 1])
}

interface RouteHelpText {
  [route: string]: HelpText;
}

interface HelpTextData {
  [lang: string]: RouteHelpText;
}

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss']
})
export class HelpDialogComponent {
  @HostListener('window:resize', ['$event'])
  public helpHeader: string = '';
  public helpDescriptions: SafeHtml[] = [];
  displayMinimize: boolean = false;
    isApp: boolean = false;
  lang: string = 'de';
  submittingRequest: boolean = false;
  isShowHelp: boolean = false;
  constructor(private translate: TranslateService,
              private helpService: HelpService,
              private userService:UserService,
              private router:Router,
              private fileOpener: FileOpener,
              private platformService: PlatformService,
              private sanitizer: DomSanitizer,
              private dialogRef: MatDialogRef<HelpDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { route: string }, private languageService: LanguageService) {
  }

  ngOnInit(): void {
    this.isApp = this.platformService.isIos || this.platformService.isAndroid;
    this.lang = this.languageService.getLanguage()
    const segmentRoute = getLastSegment(this.data.route)
    this.isShowHelp = this.showHelp(segmentRoute)
    this.translate.get('HELP.' + segmentRoute + '.HEADER').subscribe((res: string) => {
      this.helpHeader = res;
    });
    this.translate.get('HELP.' + segmentRoute + '.DESCRIPTION').subscribe((res: string[]) => {
      this.helpDescriptions = res.map(description => this.sanitizer.bypassSecurityTrustHtml(description));
    });
  }

  showHelp(routeSegment:string):boolean{
    if(routeSegment === 'account_overview'
      || routeSegment === 'settings'
      || routeSegment === 'allgemein'
      || routeSegment === 'messages'
      || routeSegment === 'register_tenant'
      || routeSegment === 'register'
      || routeSegment === 'details_account'
      || routeSegment === 'weekplan_pdf'
      || routeSegment === 'order_history'){
      return true;
    }
    return false;
  }
  async openHelpPdf() {
    this.submittingRequest = true;
    let lastSegment = getLastSegment(this.data.route);
    let promise = [];
    if (lastSegment === 'login') {
      promise.push(this.helpService.getSingleHelpPdfBaseLogin({routeName: lastSegment, language: this.lang}).toPromise());
    } else {
      promise.push(this.helpService.getSingleHelpPdfBase({routeName: lastSegment}).toPromise());
    }

    forkJoin(promise)
      .subscribe({
        next: async (help: any) => {
          if(!help[0]) {
            return;
          }
          if (this.isApp) {
            await downloadPdfHelpIos(help[0], this.fileOpener);
          } else {
            downloadPdfWeb(help[0], help[0].nameFile);
          }
        },
        error: (err) => {
          console.error('Error loading PDF', err);
        },
        complete: () => {
          this.submittingRequest = false;
        }
      });
  }

  logout(){
    this.userService.deleteToken();
    this.router.navigate(['/login']);
    this.dialogRef.close(true);
  }

}
