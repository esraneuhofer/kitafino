import {Component} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant_student.class";
import {UserService} from "../../service/user.service";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {StudentService} from "../../service/student.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-register-student',
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.scss']
})
export class RegisterStudentComponent {

  submittingRequest = false;
  studentModel = {firstName: '', lastName:''}
  constructor(private tenantServiceStudent: TenantServiceStudent,
              private router:Router,
              private toaster:ToastrService,
              private studentService: StudentService) {
  }

  addStudent(f:NgForm) {
    this.submittingRequest = true;
      this.studentService.addStudent(this.studentModel).subscribe((res:any)=>{
        if(res.error){
          this.submittingRequest = false;
          this.toaster.error('Schüler/in konnte nicht angelegt werden','Fehler');
        }else{
          this.submittingRequest = false;
          this.toaster.success('Schüler/in wurde erfolgreich angelegt','Erfolgreich');
          f.resetForm();
        }

      })
  }

}
