import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-label-tooltip',
  templateUrl: './label-tooltip.component.html',
  styleUrls: ['./label-tooltip.component.scss']
})
export class LabelTooltipComponent {

  @Input() label: string = ''
  @Input() tooltip: string = ''
  @Input() idLabel: string  = ''

}
