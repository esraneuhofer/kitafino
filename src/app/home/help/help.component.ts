import {Component, OnInit} from '@angular/core';
import {downloadPdfHelpIos} from "../weekplan-pdf/download-ios.function";
import {downloadPdfWeb} from "../weekplan-pdf/download-web.function";
import {HelpPdfInterface, HelpService} from "../../service/help.service";
import {PlatformService} from "../../service/platform.service";
import {FileOpener} from "@ionic-native/file-opener/ngx";
import {LanguageService} from "../../service/language.service";

export interface HelpDocument {
    nameDocument: string;
    description: string;
    base64: string;
}

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  page = 1;
  pageSize = 7;
    pageLoaded: boolean = false;
    helpDocuments: HelpPdfInterface[] = [];
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
          console.log(data);
            this.helpDocuments = data;
        })
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
