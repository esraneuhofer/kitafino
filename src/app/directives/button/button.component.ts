import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit{

  @Input() additionalClass:string = '';
  @Input() isDisabled:boolean = false;
  @Input() typeButton: string = '';
  @Input() buttonType: string = 'submit';
  @Input() submittingRequest: boolean = false;
  @Input() mr: boolean = false;
  buttonClass: string = "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
  constructor() {


  }

  ngOnInit() {
    if(this.typeButton === 'warning'){
      this.buttonClass = 'bg-orange-400 hover:bg-orange-300 focus-visible:outline-orange-400'
    }
    if(this.typeButton === 'default'){
      this.buttonClass = 'bg-gray-300 hover:bg-gray-100 focus-visible:outline-gray-300'
    }
    if(this.typeButton === 'danger'){
      this.buttonClass = 'bg-red-600 hover:bg-rede-400 focus-visible:outline-red-600'
    }
    if(this.mr){
      this.buttonClass += ' mr-2'
    }
    if (this.additionalClass) {
      this.buttonClass += ` ${this.additionalClass}`;
    }
  }
}
