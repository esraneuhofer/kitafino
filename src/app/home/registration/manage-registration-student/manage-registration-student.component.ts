import {Component, OnInit} from '@angular/core';
import {forkJoin, timeout} from "rxjs";
import {CustomerInterface} from "../../../classes/customer.class";
import {StudentInterface} from "../../../classes/student.class";
import {StudentService} from "../../../service/student.service";
import {GenerellService} from "../../../service/generell.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {getSpecialFoodSelectionCustomer, SpecialFoodSelectionStudent} from "../../../functions/special-food.functions";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {ExportCsvDialogData} from "../../../directives/export-csv-dialog/export-csv-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {
  ConfirmDeleteSpecialFoodComponent
} from "../../directives/confirm-delete-special-food/confirm-delete-special-food.component";
import {PermanentOrderInterface} from "../../../classes/permanent-order.interface";
import {PermanentOrderService} from "../../../service/permant-order.service";
import {TranslateService} from "@ngx-translate/core";

export function showAllergieSelection(customerInfo:CustomerInterface,specialFoodSelection:SpecialFoodSelectionStudent []):boolean{
  if(specialFoodSelection.length ===  0){
    return false
  }
  if(customerInfo.generalSettings.allowOnlyOneMenu){
    return true
  }
  if(customerInfo.generalSettings.allergiesSetByTenant){
    return true
  }
  if(!customerInfo.generalSettings.allergiesSetByTenant){
    return false
  }
  return false;
}



@Component({
  selector: 'app-manage-registration-student',
  templateUrl: './manage-registration-student.component.html',
  styleUrls: ['./manage-registration-student.component.scss']
})
export class ManageRegistrationStudentComponent implements OnInit{

  isFlipped:boolean = false;

  subGroupUnknownModel: boolean = false;

  selectedStudent:(StudentInterface | null) = null;
  registeredStudents:StudentInterface[] = [];
  customerInfo:CustomerInterface | null = null;
  pageLoaded:boolean = false;
  submittingRequest = false;
  selectedSubgroup:string = '';
  isDisabledSubgroup:boolean = false;

  specialFoodSelection:SpecialFoodSelectionStudent [] = [];
  settings!: SettingInterfaceNew;
  selectedSpecialFood:string = '';
  permanentOrders: PermanentOrderInterface[] = [];
  showAllergieSelection = showAllergieSelection;
  setSpecialFoodEmpty(student:StudentInterface){
    const dialogRef = this.dialog.open(ConfirmDeleteSpecialFoodComponent, {
      width: '550px',
      panelClass: 'custom-dialog-container',
      position: {top: '100px'}
    });
    dialogRef.afterClosed().subscribe((result:ExportCsvDialogData) => {
      if (!result) {
        return;
      }
      student.specialFood = null;
      let promiseArray = [
        this.studentService.editStudent(student)
      ];

      student.subgroup = this.selectedSubgroup;
      const permanentOrder = this.permanentOrders.find((permanentOrder) => permanentOrder.studentId === student._id);
      if(permanentOrder){
        promiseArray.push(this.permanentOrdersService.deletePermanentOrdersUser(permanentOrder));
      }
      forkJoin(promiseArray).subscribe(()=> {
        this.actionsAfterEditStudent();
      })
    })

  }
  constructor(  private router:Router,
                private translate: TranslateService,
                private dialog: MatDialog,
                private permanentOrdersService: PermanentOrderService,
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
  actionsAfterEditStudent(){
    this.selectedSubgroup = '';
    this.selectedStudent = null;
    this.submittingRequest = false;
    this.isFlipped = false;
    this.toaster.success('Änderung wurden erfolgreich übernommen','Erfolgreich');
  }
  editStudent(student:StudentInterface){
    this.submittingRequest = true;
    student.subgroup = this.selectedSubgroup;
    this.studentService.editStudent(student).subscribe(response =>{
      this.actionsAfterEditStudent();
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
    this.submittingRequest = true;
    setTimeout(() =>this.router.navigate(['../home/register_student'], {relativeTo: this.r.parent}), 30);

  }
  setSubgroupSelection(event: boolean) {
    if(event) {
      this.selectedSubgroup = '';
    }
  }
  selectStudent(student:StudentInterface){
    this.selectedStudent = student;
    this.selectedSubgroup = student.subgroup;
    if(this.selectedStudent && this.selectedStudent._id && this.selectedStudent.subgroup){
      this.isDisabledSubgroup = true
    }
    setTimeout(() => this.isFlipped = true, 50);
  }

  ngOnInit() {
    forkJoin(
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser(),
      this.generellService.getSettingsCaterer(),
      this.permanentOrdersService.getPermanentOrdersUser(),

    )
      .subscribe(([customer,students,settings,permanentOrders]:[CustomerInterface,StudentInterface[],SettingInterfaceNew,PermanentOrderInterface[]])=>{
        this.customerInfo = customer;
        this.registeredStudents = students;
        this.settings = settings;
        this.permanentOrders = permanentOrders;
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


  getAllergieFoodTextEdit(customerInfo:CustomerInterface,specialFoodSelection:SpecialFoodSelectionStudent []):string{
    if(specialFoodSelection.length ===  0){
      return ''
    }
    if(customerInfo.generalSettings.allowOnlyOneMenu){
      return  this.translate.instant('EDIT_SPECIAL_FOOD_ONLY_ONE_MENU')
    }
    if(customerInfo.generalSettings.allergiesSetByTenant){
      return this.translate.instant('EDIT_SPECIAL_FOOD_ONLY_ONE_MENU')
    }
    if(!customerInfo.generalSettings.allergiesSetByTenant){
      return this.translate.instant('EDIT_SPECIAL_CHANGE_BY_PARENT')
    }


    return '';

  }


}
