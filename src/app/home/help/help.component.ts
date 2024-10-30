import {Component, OnInit} from '@angular/core';
import {downloadPdfHelpIos} from "../weekplan-pdf/download-ios.function";
import {downloadPdfWeb} from "../weekplan-pdf/download-web.function";
import {HelpPdfInterface, HelpService} from "../../service/help.service";
import {PlatformService} from "../../service/platform.service";
import {FileOpener} from "@ionic-native/file-opener/ngx";
import {LanguageService} from "../../service/language.service";

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  query:string = 'all'
  page = 1;
  pageSize = 12;
    pageLoaded: boolean = false;
    helpDocuments: HelpPdfInterface[] = [];
  helpDocumentsOriginal: HelpPdfInterface[] = [];

    submittingRequest: boolean = false;
    lang: string = 'de'
  isApp: boolean = false;
    constructor(private helpService: HelpService,
                private fileOpener: FileOpener,
                private platformService: PlatformService,
                private languageService: LanguageService,) {
    }

    ngOnInit() {
        this.pageLoaded = true;
      this.isApp = this.platformService.isIos || this.platformService.isAndroid;
        this.lang = this.languageService.getLanguage();
        this.helpService.getAllHelpPdfNames().subscribe((data: HelpPdfInterface[]) => {
            this.helpDocuments =this.helpDocumentsOriginal = data;
        })
    }

  changeSelection(event: string) {
      let copy = JSON.parse(JSON.stringify(this.helpDocumentsOriginal));
      if (event === 'all') {
          this.helpDocuments = copy;
      } else if(event === 'help') {
        this.helpDocuments = copy.filter((doc: HelpPdfInterface) => doc.routeName !== 'login');
      }else{
        this.helpDocuments = copy.filter((doc: HelpPdfInterface) => doc.routeName === 'login');

      }
  }
  async openHelpPdf(helpDocument: HelpPdfInterface) {
      this.submittingRequest = true;
    this.helpService.getSingleHelpPdfBase({routeName:helpDocument.routeName}).subscribe(async (data: any) => {
      if (this.isApp) {
        await downloadPdfHelpIos(data, this.fileOpener);
        this.submittingRequest = false;

      } else {
        downloadPdfWeb(data,data.nameFile);
        this.submittingRequest = false;

      }
    });
  }


}
