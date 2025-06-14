import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { StudentInterface } from "../../../classes/student.class";
import { SettingInterfaceNew } from "../../../classes/setting.class";
import { QueryInterOrderInterface } from "../../../functions/weekplan.functions";
import { addDayFromDate } from "../order.functions";
import { formatDateInput, normalizeToBerlinDate } from "../../../functions/date.functions";
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-date-selection-single',
  templateUrl: './date-selection-single.component.html',
  styleUrls: ['./date-selection-single.component.scss'],
})
export class DateSelectionSingleComponent implements OnInit {
  @Input() registeredStudents!: StudentInterface[];
  @Input() settings!: SettingInterfaceNew;
  @Input() minWidth: boolean = false;
  @Output() getOrderDay: any = new EventEmitter<Date>();
  @Output() selectStudent: any = new EventEmitter<StudentInterface | null>();
  @Input() displaySettings: boolean = false;
  @Output() editDisplaySettings: any = new EventEmitter<boolean>();

  selectedStudent: StudentInterface | null = null;
  selectedDate: string = normalizeToBerlinDate(new Date());


  constructor() { }

  ngOnInit() {
    // Initialisierung mit normalisiertem Datum
    const currentDate = normalizeToBerlinDate(new Date());

    if (this.registeredStudents.length >= 1) {
      this.selectedStudent = this.registeredStudents[0];
      // this.getOrderDay.emit(this.selectedDate)
    }
  }

  // Method to get date as a string in YYYY-MM-DD format
  getSelectedDateString(): string {
    return this.selectedDate;
  }

  // Method to handle date change
  onDateChange(event: any) {
    // this.selectedDate = normalizeToBerlinDate(event.target.value);
    this.selectedDate = event.target.value; // Use the raw value from the input
    this.getOrderDay.emit(this.selectedDate);

    const inputElement = event.target as HTMLInputElement;
    setTimeout(() => {
      inputElement.blur();
    }, 100);
  }

  // Utility method to format Date to YYYY-MM-DD string
  setStudent(student: StudentInterface | null) {
    this.selectedStudent = student;
    this.selectStudent.emit(this.selectedStudent);
  }
  editTenantOrderSettings(event: boolean): void {
    this.editDisplaySettings.emit(event);
  }
}
