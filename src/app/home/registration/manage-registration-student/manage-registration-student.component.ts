import {Component, OnInit} from '@angular/core';
import {forkJoin} from "rxjs";
import {CustomerInterface} from "../../../classes/customer.class";
import {StudentInterface} from "../../../classes/student.class";
import {StudentService} from "../../../service/student.service";
import {GenerellService} from "../../../service/generell.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {getSpecialFoodSelectionCustomer, SpecialFoodSelectionStudent} from "../../../functions/special-food.functions";
import {SettingInterfaceNew} from "../../../classes/setting.class";

@Component({
  selector: 'app-manage-registration-student',
  templateUrl: './manage-registration-student.component.html',
  styleUrls: ['./manage-registration-student.component.scss']
})
export class ManageRegistrationStudentComponent implements OnInit{

  subGroupUnknownModel: boolean = false;

  selectedStudent:(StudentInterface | null) = null;
  registeredStudents:StudentInterface[] = [];
  customerInfo!:CustomerInterface;
  pageLoaded:boolean = false;
  submittingRequest = false;
  selectedSubgroup:string = '';
  specialFoodSelection:SpecialFoodSelectionStudent [] = [];
  settings!: SettingInterfaceNew;
  selectedSpecialFood:string = '';

  setSpecialFoodEmpty(student:StudentInterface){
    student.specialFood = null;
   this.editStudent(student);
  }
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
    this.submittingRequest = true;
    student.subgroup = this.selectedSubgroup;
    this.studentService.editStudent(student).subscribe(response =>{
      this.selectedSubgroup = '';
      this.selectedStudent = null;
      this.submittingRequest = false;
      this.toaster.success('Änderung wurden erfolgreich übernommen','Erfolgreich');

    })
  }

  getSpecialFoodFromId(id:string,settings:SettingInterfaceNew):string{
    let nameSpecialFood = 'Sonderessen nicht gefunden'
    if(settings.orderSettings.specialFoods.length > 0){
      settings.orderSettings.specialFoods.forEach(eachSpecialFood =>{
        if(eachSpecialFood._id === id){
          nameSpecialFood = eachSpecialFood.nameSpecialFood;
        }
      })
    }
    return nameSpecialFood;
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
    this.selectedSubgroup = student.subgroup;
  }
  ngOnInit() {
    forkJoin(
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser(),
      this.generellService.getSettingsCaterer()
    )
      .subscribe(([customer,students,settings]:[CustomerInterface,StudentInterface[],SettingInterfaceNew])=>{
        this.customerInfo = customer;
        this.registeredStudents = students;
        this.settings = settings;
        this.specialFoodSelection = getSpecialFoodSelectionCustomer(this.customerInfo,this.settings);
        this.pageLoaded = true;
      })

  }

  isSelected(event:string){
    this.subGroupUnknownModel = false;
    if(this.selectedStudent){
      this.selectedStudent.subgroup = event;
    }

  }

  selectSpecialFood(event:string,selectedStudent:StudentInterface):void{
    selectedStudent.specialFood = event;
  }
}
