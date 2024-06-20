import {Component, OnInit} from '@angular/core';
import {HelpPdfInterface, HelpService} from "../../service/help.service";
import {LanguageService} from "../../service/language.service";
import {PlatformService} from "../../service/platform.service";

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
                private platformService: PlatformService,
                private languageService: LanguageService,) {
    }

    ngOnInit() {
        this.pageLoaded = true;
      this.isApp = this.platformService.isIos || this.platformService.isAndroid;
        this.lang = this.languageService.getLanguage();

        this.helpService.getAllHelpPdfNames().subscribe((data: HelpPdfInterface[]) => {
            this.helpDocuments = data;
        })
    }

  async openHelpPdf(id: string) {
    this.helpService.downloadHelpPdf(id).subscribe(
      (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
        // Optional: URL-Revoke, um Speicher freizugeben, wenn der Blob nicht mehr benötigt wird.
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      },
      (error) => {
        console.error('Download error', error);
      }
    );
  }


}
