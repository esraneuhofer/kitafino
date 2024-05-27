import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {isWidthToSmall} from "../../home/order-student/order-container/order-container.component";
import {TranslateService} from "@ngx-translate/core";
import {LanguageService} from "../../service/language.service";
import {help_text, InterfaceHelpLanguage} from "../../home/help_text";

interface HelpText {
    header: string;
    contentSmall: string[];
    contentRegular: string[];
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
    selectedJSON: {
        headerHelp: string,
        contentHelp: string[]
    } = {
        headerHelp: '',
        contentHelp: []
    }
    displayMinimize: boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        route: string
    }, private languageService: LanguageService) {
        let lang = this.languageService.getLanguage();
        let helpText: InterfaceHelpLanguage = help_text;
        if (!lang) {
            lang = 'de';
        }

        // this.displayMinimize = isWidthToSmall(window.innerWidth);
        // if (this.displayMinimize) {
        //     this.selectedJSON.contentHelp = object.contentSmall;
        // } else {
        //     this.selectedJSON.contentHelp = object.contentRegular;
        // }
    }


}
