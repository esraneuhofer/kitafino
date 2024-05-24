import {Component, OnInit} from '@angular/core';

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

    pageLoaded: boolean = false;
    helpDocuments: any[] = [];
    submittingRequest: boolean = false;

    constructor() {
    }

    ngOnInit() {
        this.pageLoaded = true;
    }

    selectDocument(document: any) {

    }

}
