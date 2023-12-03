import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-button-spinner',
  templateUrl: './button-spinner.component.html',
  styleUrls: ['./button-spinner.component.scss']
})
export class ButtonSpinnerComponent {
  @Input() submittingRequest: boolean  =false;
  @Input() btnText: string  ='Bestätigen';

}
