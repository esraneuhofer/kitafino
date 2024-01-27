import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {UserService} from "../../service/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {StudentService} from "../../service/student.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {ToastrService} from "ngx-toastr";
import {setEmptyStudentModel, StudentInterface} from "../../classes/student.class";
import {GenerellService} from "../../service/generell.service";
import {CustomerInterface, CustomerOrderSplit} from "../../classes/customer.class";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-register-student',
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.scss']
})
export class RegisterStudentComponent implements OnInit{

  returnedUsernameStudent:string  ='';
  submittingRequest = false;
  studentModel:StudentInterface = setEmptyStudentModel();
  selectedSubgroup:string = '';
  isFlipped:boolean = false;
  studentAdded = {
    username:'',
    firstName:'',
    lastName:''
  }
  pageLoaded:boolean = false;
  customerInfo!:CustomerInterface;
  subGroupUnknownModel: boolean = false;
  registeredStudents:StudentInterface[] = [];

  constructor(private studentService: StudentService,
              private router:Router,
              private toaster:ToastrService,
              private r: ActivatedRoute,
              private generellService: GenerellService) {
  }



  directToRoute(route:string){
    this.router.navigate(['../home/' +route], {relativeTo: this.r.parent});
  }
  reloadPage(){
    window.location.reload();
  }
  setSubgroupSelection(event: boolean) {
    if(event) {
      this.selectedSubgroup = '';
    }
  }
  isSelected(event:string){
    this.subGroupUnknownModel = false;
    this.studentModel.subgroup = event;
  }
  ngOnInit() {
    forkJoin(
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser()
    )
    .subscribe(([customer,students]:[CustomerInterface,StudentInterface[]])=>{
      this.customerInfo = customer;
      this.registeredStudents = students;
      this.pageLoaded = true;
    })

  }
  addStudent(f:NgForm) {
    this.studentModel.subgroup = this.selectedSubgroup;
    this.submittingRequest = true;
      this.studentService.addStudent(this.studentModel).subscribe((res: { error:boolean,student:StudentInterface })=>{
        if(res.error){
          this.submittingRequest = false;
          this.toaster.error('Schüler/in konnte nicht angelegt werden','Fehler');
        }else{
          this.submittingRequest = false;
          this.isFlipped = true;
          this.returnedUsernameStudent = res.student.username
          this.toaster.success('Verpflegungsteilnehmer/in wurde erfolgreich angelegt','Erfolgreich');
          f.resetForm();
        }

      })
  }

}
