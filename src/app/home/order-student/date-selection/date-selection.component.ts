import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {getWeekNumber, timeDifference} from "../order.functions";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {getCalenderQuery, getYearsQuery} from "./date-selection.functions";
import {QueryInterOrderInterface} from "../../../functions/weekplan.functions";
import {StudentInterface} from "../../../classes/student.class";

@Component({
  selector: 'app-date-selection',
  templateUrl: './date-selection.component.html',
  styleUrls: ['./date-selection.component.scss']
})
export class DateSelectionComponent  implements OnInit {


  @Input() registeredStudents!: StudentInterface[];
  @Input() settings!: SettingInterfaceNew;
  @Output() getOrderWeek:any = new EventEmitter<QueryInterOrderInterface>();
  @Output() selectStudent:any = new EventEmitter<StudentInterface | null>();

  selectedStudent: (StudentInterface | null) = null;
  selectedIndexYear:number = 1;
  queryCalenderWeek:{ value: string; week: number }[] =[];
  queryYears: { year: number; index: number }[] = [];
  query:QueryInterOrderInterface = {week: getWeekNumber(new Date()), year: new Date().getFullYear()};
  generatedKWArray: { value: string; week: number }[][] = [];
    constructor() { }

    ngOnInit() {
      this.queryYears = getYearsQuery();
      this.generatedKWArray = getCalenderQuery(new Date().getFullYear());
      this.queryCalenderWeek = this.generatedKWArray[this.selectedIndexYear]; //Selects Calenderquery Array to current Year
      this.query.year = this.queryYears[this.selectedIndexYear].year; //Sets Year Query to current Year
      this.query.week = this.queryCalenderWeek[getWeekNumber(new Date()) - 1].week; //Selects current CW

      if (this.registeredStudents.length === 1) {
        this.selectedStudent = this.registeredStudents[0];
      }
      this.selectedStudent = this.registeredStudents[0];

      this.selectStudent.emit(this.selectedStudent)
      this.getOrderWeek.emit(this.query)
    }
  initOrderForWeek(event:number,selectedStudent:StudentInterface | null){
    this.query.week = event;
    this.getOrderWeek.emit(this.query)
  }
  setCalenderWeeks(event:number) {
    for(var i = 0; i < this.queryYears.length; i++){
      if(this.queryYears[i].year === event){
        this.selectedIndexYear = i;
      }
    }
    this.query.year = event;
    this.queryCalenderWeek = this.generatedKWArray[this.selectedIndexYear];
    this.query.week = this.generatedKWArray[this.selectedIndexYear][0].week;
    this.initOrderForWeek(this.query.week,this.selectedStudent)

  }

  setStudent(student:StudentInterface | null){
      this.selectedStudent = student;
      this.selectStudent.emit(this.selectedStudent)
  }
}
