import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {isWidthToSmall} from "../../home/order-student/order-container/order-container.component";
import {TranslateService} from "@ngx-translate/core";
import {LanguageService} from "../../service/language.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HelpService} from "../../service/help.service";
import {downloadPdfHelpIos, downloadPdfIos} from "../../home/weekplan-pdf/download-ios.function";
import {downloadPdfWeb} from "../../home/weekplan-pdf/download-web.function";
import {PlatformService} from "../../service/platform.service";
import {FileOpener} from "@ionic-native/file-opener/ngx";

interface HelpText {
  header: string;
  contentSmall: string[];
  contentRegular: string[];
}

function getLastSegment(route: string): string {
  const segments = route.split('/');
  return segments[segments.length - 1];
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

  constructor(private translate: TranslateService,
              private helpService: HelpService,
              private fileOpener: FileOpener,
              private platformService: PlatformService,
              private sanitizer: DomSanitizer,
              @Inject(MAT_DIALOG_DATA) public data: { route: string }, private languageService: LanguageService) {
  }

  ngOnInit(): void {
    this.isApp = this.platformService.isIos || this.platformService.isAndroid;
    this.lang = this.languageService.getLanguage()
    console.log(getLastSegment(this.data.route));
    this.translate.get('HELP.' + getLastSegment(this.data.route) + '.HEADER').subscribe((res: string) => {
      this.helpHeader = res;
    });
    this.translate.get('HELP.' + getLastSegment(this.data.route) + '.DESCRIPTION').subscribe((res: string[]) => {
      this.helpDescriptions = res.map(description => this.sanitizer.bypassSecurityTrustHtml(description));
    });
  }

  async openHelpPdf() {
    this.helpService.getSingleHelpPdfBase({routeName: getLastSegment(this.data.route)}).subscribe(async (data: any) => {
      console.log(data);
      if (this.isApp) {
        await downloadPdfHelpIos(data, this.fileOpener);
      } else {
        downloadPdfWeb(data);
      }
    });
  }

}
