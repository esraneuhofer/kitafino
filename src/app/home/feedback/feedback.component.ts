import { Component, OnInit } from '@angular/core';
import { GenerellService } from "../../service/generell.service";
import { MessageService } from "../../service/message.service";
import { MessageDialogService } from "../../service/message-dialog.service";
import { NgForm } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  pageLoaded = false;
  submittingRequest = false;
  feedbackModel = {
    message: ''
  }

  constructor(private generalService: GenerellService,
    private translate: TranslateService,
    private messageService: MessageDialogService) {

  }

  ngOnInit() {
    this.pageLoaded = true;
  }

  sendFeedback(form: NgForm) {
    this.submittingRequest = true;
    this.generalService.sendFeedback(this.feedbackModel).subscribe(
      () => {
        this.submittingRequest = false;
        form.resetForm()
        this.feedbackModel.message = '';
        this.messageService.openMessageDialog(
          this.translate.instant("DIALOG_FEEDBACK_MESSAGE"),
          this.translate.instant("ACCOUNT.THANK_YOU"), 'success');
      },
      () => {
        this.submittingRequest = false;
      }
    )
  }
}
