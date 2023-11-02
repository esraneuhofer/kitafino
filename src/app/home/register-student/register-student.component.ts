import {Component} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant_student.class";
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {StudentService} from "../../service/student.service";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-register-student',
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.scss']
})
export class RegisterStudentComponent {

  isNotification = true;

  close(){
    this.isNotification = false
  }

  studentModel = {firstName: '', lastName:''}
  constructor(private tenantServiceStudent: TenantServiceStudent,
              private router:Router,
              private studentService: StudentService) {

  }

  addStudent(f:NgForm) {
      this.studentService.addStudent(this.studentModel).subscribe((res:any)=>{

        f.resetForm();
      })
  }

}
