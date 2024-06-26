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
import {TranslateService} from "@ngx-translate/core";
import {FirstAccessDialogComponent} from "../../directives/first-access-dialog/first-access-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MessageDialogService} from "../../service/message-dialog.service";


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
              private dialog: MatDialog,
              private dialogService: MessageDialogService,
              private generellService: GenerellService,
              private tenantService: TenantServiceStudent,
              private dialogeService: MessageDialogService,
              private translate: TranslateService){
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
  selectSpecialFood(event:string):void{
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
      this.customerInfo.generalSettings.subGroupSettingTenant = true;
      if(this.customerInfo.order.split.length === 1){
        this.selectedSubgroup = this.customerInfo.order.split[0].group;
      }
      this.registeredStudents = students;
      this.tenantStudent = tenant;
      this.settings = settings;
      this.specialFoodSelection = getSpecialFoodSelectionCustomer(this.customerInfo,this.settings);
      // if(!this.tenantStudent.firstAccess){
      //   const dialogRef = this.dialog.open(FirstAccessDialogComponent, {
      //     width: '600px',
      //     data: this.tenantStudent,
      //     panelClass: 'custom-dialog-container',
      //     position: {top: '1150px'}
      //   });
      // }
      this.pageLoaded = true;
    })
  }

  openDialog(type:string) {
    let heading;
    let reason;
    if(type === 'special'){
       heading = this.translate.instant('SPECIAL_FOOD_LABEL')
       reason = this.translate.instant('SPECIAL_FOOD_INSTRUCTIONS')
    }else{
       heading = this.translate.instant('SUBGROUP_LABEL')
       reason = this.translate.instant('SUBGROUP_REGISTER_STUDENT_INSTRUCTIONS_TOOLTIP')
    }

    this.dialogService.openMessageDialog(reason, heading,'info');
    console.log('open dialog');
  }

  addStudent(f:NgForm) {
    // this.submittingRequest = true;
    this.studentModel.subgroup = this.selectedSubgroup;
    this.studentService.addStudent(this.studentModel).subscribe((res: { error:boolean,student:StudentInterface })=>{
        if(res.error){
          this.submittingRequest = false;
          this.toaster.error(this.translate.instant("REGISTER_STUDENT_ERROR_TOASTR"),this.translate.instant("ERROR_TITLE"));
        }else{
          this.submittingRequest = false;
          this.isFlipped = true;
          this.returnedUsernameStudent = res.student.username
          this.dialogeService.openMessageDialog(
            this.translate.instant("REGISTER_SUCCESS_TOASTR"),
            this.translate.instant("SUCCESS"),
            'success');
          // this.toaster.success(this.translate.instant("REGISTER_SUCCESS_TOASTR"),this.translate.instant("SUCCESS"));
          f.resetForm();

          const emailBody = getEmailBodyRegistrationStudent(this.customerInfo,res.student,this.tenantStudent,this.settings,this.translate);
          this.generalService.sendEmail(emailBody).subscribe((data: any) => {
            // this.toaster.success(this.translate.instant("REGISTRATION_STUNDENT_EMAIL_SENT"),this.translate.instant("SUCCESS"));
          })

        }

      })
  }

}
