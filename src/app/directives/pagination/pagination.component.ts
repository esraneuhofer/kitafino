import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {

  @Input() page = 1;
  @Output() changePage = new EventEmitter<number>(); //Triggers Reload getSplits => recalculate Total

  @Output()
  nextPage(number:number){
    this.changePage.emit(number);
  }
}
