import {Component, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {HelpService} from "../../../service/help.service";
import {UserService} from "../../../service/user.service";
import {Router} from "@angular/router";
import {PlatformService} from "../../../service/platform.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {LanguageService} from "../../../service/language.service";
import {getLastSegment} from "../../../directives/help-dialog/help-dialog.component";
import {NgForm} from "@angular/forms";
import {ToastrService} from "ngx-toastr";

// Interface für das Model
export interface ErrorReportModel {
  message: string;
  typeError: string;
  route: string;
}

@Component({
  selector: 'app-report-error-dialog',
  templateUrl: './report-error-dialog.component.html',
  styleUrls: ['./report-error-dialog.component.scss']
})
export class ReportErrorDialogComponent implements OnInit {
  @ViewChild('f1') form!: NgForm;

  @HostListener('window:resize', ['$event'])
  displayMinimize: boolean = false;
  isApp: boolean = false;
  lang: string = 'de';
  submittingRequest: boolean = false;

  // Model für das Formular
  model: ErrorReportModel = {
    message: '',
    typeError: '',
    route:''
  };

  optionSelection:{type:string,value:string}[] = [
    {type: 'fehler',value: 'Fehler'},
    {type: 'verbesserung',value: 'Verbesserung'},
    {type: 'frage',value: 'Frage'},
  ];

  constructor(private translate: TranslateService,
              private helpService: HelpService,
              private toastr:ToastrService,
              private userService: UserService,
              private router: Router,
              private platformService: PlatformService,
              private dialogRef: MatDialogRef<ReportErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { route: string },
              private languageService: LanguageService) {
  }

  ngOnInit(): void {
    this.isApp = this.platformService.isIos || this.platformService.isAndroid;
    this.lang = this.languageService.getLanguage();
    const segmentRoute = getLastSegment(this.data.route);
    this.model.route = segmentRoute;
  }

  sendMessage(form: NgForm) {

    // Markiere das Formular als übermittelt
    form.onSubmit(new Event('submit'));

    if (form.invalid) {
      return;
    }

    if (!this.model.message || !this.model.typeError) {
      return;
    }

    this.submittingRequest = true;

    // API-Aufruf mit dem Model inklusive Route
    this.helpService.sendErrorReport(this.model).subscribe({
      next: (response) => {
        // Erfolgreiche Antwort mit message und typeError an Frontend übergeben
        if (response && response.success) {
          this.dialogRef.close({
            success: true,
            message: response.message,
            typeError: response.typeError,
            reportId: response.reportId
          });
          this.toastr.success(response.message, 'Erfolg', {
            timeOut: 5000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
        } else {
          this.toastr.error('Fehler beim Senden des Berichts', 'Fehler', {
            timeOut: 5000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
          this.dialogRef.close({
            success: false,
            message: 'Unbekannter Fehler'
          });
        }
        this.submittingRequest = false;
      },
      error: (error) => {
        this.dialogRef.close({
          success: false,
          message: error.message || 'Fehler beim Senden des Berichts'
        });
        this.toastr.error('Fehler beim Senden des Berichts', 'Fehler', {
          timeOut: 5000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
        this.submittingRequest = false;
      }
    });
  }

  changeType(event: string) {
    this.model.typeError = event;
  }
}
