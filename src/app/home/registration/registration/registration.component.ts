import { Component } from '@angular/core';
import {StudentService} from "../../../service/student.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {

  noRegistration:boolean = false;
  constructor(private studentService: StudentService,) {
  }

  ngOnInit() {
    this.studentService.getRegisteredStudentsUser().subscribe(students =>{
      if(students.length > 0){
        this.noRegistration = false;
      }else{
        this.noRegistration = true;

      }
    })

  }
}
