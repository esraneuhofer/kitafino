import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {StudentInterface} from "../../../classes/student.class";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {QueryInterOrderInterface} from "../../../functions/weekplan.functions";
import {addDayFromDate} from "../order.functions";
import {formatDateInput} from "../../../functions/date.functions";
@Component({
  selector: 'app-date-selection-single',
  templateUrl: './date-selection-single.component.html',
  styleUrls: ['./date-selection-single.component.scss']
})
export class DateSelectionSingleComponent implements OnInit {

  @Input() registeredStudents!: StudentInterface[];
  @Input() settings!: SettingInterfaceNew;
  @Input() minWidth: boolean = false;
  @Output() getOrderDay:any = new EventEmitter<Date>();
  @Output() selectStudent:any = new EventEmitter<StudentInterface | null>();
  @Input() displaySettings:boolean = false;
  @Output() editDisplaySettings:any = new EventEmitter<boolean>();

  selectedStudent: (StudentInterface | null) = null;
  selectedDate: Date = new Date()

  constructor() { }


  ngOnInit() {
    this.selectedDate = addDayFromDate(new Date(),0); // Initialize with the current date or any other date
    if (this.registeredStudents.length >= 1) {
      this.selectedStudent = this.registeredStudents[0];
      // this.getOrderDay.emit(this.selectedDate)
    }
  }

  // Method to get date as a string in YYYY-MM-DD format
  getSelectedDateString(): string {
    return formatDateInput(this.selectedDate);
  }

  // Method to handle date change
  onDateChange(event: any) {
    this.selectedDate = new Date(event.target.value);
    this.getOrderDay.emit(this.selectedDate)
    const inputElement = event.target as HTMLInputElement;
    setTimeout(() => {
      inputElement.blur();
    }, 100); // 100 ms Verzögerung
  }

  // Utility method to format Date to YYYY-MM-DD string
  setStudent(student:StudentInterface | null){
    this.selectedStudent = student;
    this.selectStudent.emit(this.selectedStudent)
  }
  editTenantOrderSettings(event:boolean):void{
    this.editDisplaySettings.emit(event)
  }

}
