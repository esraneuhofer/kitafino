import {Component, OnInit} from '@angular/core';
import {forkJoin} from "rxjs";
import {CustomerInterface} from "../../../classes/customer.class";
import {StudentInterface} from "../../../classes/student.class";
import {StudentService} from "../../../service/student.service";
import {GenerellService} from "../../../service/generell.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-manage-registration-student',
  templateUrl: './manage-registration-student.component.html',
  styleUrls: ['./manage-registration-student.component.scss']
})
export class ManageRegistrationStudentComponent implements OnInit{

  subGroupUnknownModel: boolean = false;

  selectedStudent!:StudentInterface;
  registeredStudents:StudentInterface[] = [];
  customerInfo!:CustomerInterface;
  pageLoaded:boolean = false;
  submittingRequest = false;
  selectedSubgroup:string = '';

  constructor(  private router:Router,
                private toaster:ToastrService,
                private r: ActivatedRoute,
                private studentService: StudentService,private generellService:GenerellService) {
  }

  getSubGroupNameFromId(groupId:string,customerInfo:CustomerInterface):string{
    let groupName = 'Nicht zugeordnet';
    customerInfo.order.split.forEach((subgroup)=>{
      if(subgroup.group == groupId){
        groupName = subgroup.displayGroup;
      }
    })
    return groupName;

  }
  editStudent(student:StudentInterface){

  }
  routeToAccount(){
    this.router.navigate(['../home/register_student'], {relativeTo: this.r.parent});
  }
  setSubgroupSelection(event: boolean) {
    if(event) {
      this.selectedSubgroup = '';
    }
  }
  selectStudent(student:StudentInterface){
    this.selectedStudent = student;
  }
  ngOnInit() {
    forkJoin(
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser()
    )
      .subscribe(([customer,students]:[CustomerInterface,StudentInterface[]])=>{
        this.customerInfo = customer;
        this.registeredStudents = students;
        console.log(students)
        this.pageLoaded = true;
      })

  }

  isSelected(event:string){
    this.subGroupUnknownModel = false;
    this.selectedStudent.subgroup = event;
  }
}
