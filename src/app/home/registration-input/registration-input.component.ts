import {Component, Input, OnInit} from '@angular/core';
import {StudentInterface} from "../../classes/student.class";
import {NgForm} from "@angular/forms";
import {GenerellService} from "../../service/generell.service";
import {CustomerInterface} from "../../classes/customer.class";

@Component({
  selector: 'app-registration-input',
  templateUrl: './registration-input.component.html',
  styleUrls: ['./registration-input.component.scss']
})
export class RegistrationInputComponent implements OnInit{


  @Input()studentModel!:StudentInterface;
  @Input() f1!:NgForm
  customerInfo?:CustomerInterface;

  selectedSubgroup:string = '';
  subGroupUnknownModel: boolean = false;
  pageLoaded:boolean = false;
  constructor(private generellService: GenerellService) {
  }

  ngOnInit() {
    this.generellService.getCustomerInfo().subscribe((customerInfo: CustomerInterface) => {
      this.customerInfo = customerInfo;
      this.pageLoaded = true;
    })
  }


  isSelected(event:string){
    this.subGroupUnknownModel = false;
    this.studentModel.subgroup = event;
  }

  setSubgroupSelection(event: boolean) {
    if(event) {
      this.selectedSubgroup = '';
    }
  }
}
