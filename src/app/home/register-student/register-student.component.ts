import {CustomerInterface} from "../../classes/customer.class";
import {Component, OnInit} from "@angular/core";
import {setEmptyStudentModel, StudentInterface} from "../../classes/student.class";
import {TenantStudentInterface} from "../../classes/tenant.class";
import {getSpecialFoodSelectionCustomer, SpecialFoodSelectionStudent} from "../../functions/special-food.functions";
import {StudentService} from "../../service/student.service";
import {GenerellService} from "../../service/generell.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {TenantServiceStudent} from "../../service/tenant.service";
import {forkJoin} from "rxjs";
import {NgForm} from "@angular/forms";
import {getEmailBodyRegistrationStudent} from "./email-registration-student";
import {SettingInterfaceNew} from "../../classes/setting.class";

function getRegistrationText(customer:CustomerInterface):string{
  if(customer.order.split.length > 1){
    return 'Die Zuordnung der Schüler/innen zu den Verpflegungsgruppen erfolgt durch die Schule. Nach der Zuronderung durch die Einrichtung können Sie eine Bestellung aufgeben.';
  }
 return  ''
}
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

  selectedSpecialFood:string = '';
  registrationText:string = '';
  pageLoaded:boolean = false;
  customerInfo!:CustomerInterface;
  subGroupUnknownModel: boolean = false;
  registeredStudents:StudentInterface[] = [];
  tenantStudent!:TenantStudentInterface;
  specialFoodSelection:SpecialFoodSelectionStudent [] = [];
  settings!:SettingInterfaceNew;
  constructor(private studentService: StudentService,
              private generalService: GenerellService,
              private router:Router,
              private toaster:ToastrService,
              private r: ActivatedRoute,
              private generellService: GenerellService,
              private tenantService: TenantServiceStudent){
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
  // isSelected(event:string){
  //   this.subGroupUnknownModel = false;
  //   this.studentModel.subgroup = event;
  // }
  selectSpecialFood(event:string):void{
    console.log('event',event)
    this.studentModel.specialFood = event;
  }
  ngOnInit() {
    forkJoin(
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser(),
      this.tenantService.getTenantInformation(),
      this.generalService.getSettingsCaterer()
    )
    .subscribe(([customer,students,tenant,settings]:[CustomerInterface,StudentInterface[],TenantStudentInterface,SettingInterfaceNew])=>{
      this.customerInfo = customer;
      if(this.customerInfo.order.split.length === 1){
        this.selectedSubgroup = this.customerInfo.order.split[0].group;
      }
      this.registeredStudents = students;
      this.tenantStudent = tenant;
      this.settings = settings;
      this.registrationText = getRegistrationText(this.customerInfo);
      this.specialFoodSelection = getSpecialFoodSelectionCustomer(this.customerInfo,this.settings);
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

          const emailBody = getEmailBodyRegistrationStudent(this.customerInfo,res.student,this.tenantStudent);
          this.generalService.sendEmail(emailBody).subscribe((data: any) => {
            this.toaster.success('Email wurde versendet', 'Erfolgreich')
          })

        }

      })
  }

}
