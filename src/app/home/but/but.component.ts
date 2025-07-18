import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StudentInterfaceId } from "../../classes/student.class";
import { AccountCustomerInterface } from "../../classes/account.class";
import { PermanentOrderInterface } from "../../classes/permanent-order.interface";
import { CustomerInterface } from "../../classes/customer.class";
import { SettingInterfaceNew } from "../../classes/setting.class";
import { TenantStudentInterface } from "../../classes/tenant.class";
import { GenerellService } from "../../service/generell.service";
import { ToastrService } from "ngx-toastr";
import { TenantServiceStudent } from "../../service/tenant.service";
import { StudentService } from "../../service/student.service";
import { AccountService } from "../../service/account.serive";
import { PermanentOrderService } from "../../service/permant-order.service";
import { MessageDialogService } from "../../service/message-dialog.service";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { dayArray } from "../../classes/weekplan.interface";
import { forkJoin } from "rxjs";
import { ButDocumentInterface, ButStudent, ButStudentInterface } from "../../classes/but.class";
import { ButService } from "../../service/but.service";
import { downloadPdfIos } from "../weekplan-pdf/download-ios.function";
import { downloadPdfWeb } from "../weekplan-pdf/download-web.function";
import { PlatformService } from "../../service/platform.service";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { displayWebFunction } from "../weekplan-pdf/display-web.function";
import { createPDF, getBase64ImageFromUrl } from "./but-request-pdf.function";
import { getInvoiceDateOne } from "../../functions/date.functions";

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { EinrichtungInterface } from "../../classes/einrichtung.class";
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-but',
  templateUrl: './but.component.html',
  styleUrls: ['./but.component.scss']
})
export class ButComponent implements OnInit {


  submittingRequestFlip: boolean = false;
  isFlipped: boolean = false;
  textBanner: string = '';
  dayArray = dayArray;
  submittingRequest = false;
  butExists = false
  pageLoaded = false;
  selectedStudent: (StudentInterfaceId | null) = null;
  bildungTeilnahme: boolean = false;
  registeredStudents: StudentInterfaceId[] = [];
  accountTenant!: AccountCustomerInterface;
  permanentOrders: PermanentOrderInterface[] = []
  customer!: CustomerInterface;
  settings!: SettingInterfaceNew;
  tenantStudent!: TenantStudentInterface;
  selectedBut: ButStudentInterface | null = null;
  butStudents: ButStudentInterface[] = [];
  selectedFile: File | null = null;
  documentsTenant: ButDocumentInterface[] = []
  confirmedButStudent: ButStudentInterface[] = []
  submittingRequestDownload: boolean = false;
  base64String: string | ArrayBuffer | null = '';
  isApp: boolean = false;
  schoolSetting: EinrichtungInterface | null = null;
  constructor(private generellService: GenerellService,
    private toastr: ToastrService,
    private fileOpener: FileOpener,
    private tenantService: TenantServiceStudent,
    private studentService: StudentService,
    private accountService: AccountService,
    private platformService: PlatformService,
    private permanentOrdersService: PermanentOrderService,
    private messageService: MessageDialogService,
    private dialog: MatDialog,
    private butService: ButService,
    private translate: TranslateService) {
    this.textBanner = translate.instant("NO_STUDENT_REGISTERED_BANNER_TEXT")
  }
  loadMockData() {

    this.confirmedButStudent = [

    ];
  }



  ngOnInit() {
    this.isApp = this.platformService.isIos || this.platformService.isAndroid

    this.loadMockData();
    forkJoin([
      this.generellService.getSettingsCaterer(),
      this.generellService.getCustomerInfo(),
      this.studentService.getRegisteredStudentsUser(),
      this.tenantService.getTenantInformation(),
      this.accountService.getAccountTenant(),
      this.butService.getButTenant(),
      this.butService.getButDocumentTenant(),
      this.generellService.getSchoolSettings()
    ]).subscribe(
      ([
        settings,
        customer,
        students,
        tenantStudent,
        accountTenant,
        butStudents,
        documentsBut,
        schoolSetting
      ]: [
          SettingInterfaceNew,
          CustomerInterface,
          StudentInterfaceId[],
          TenantStudentInterface,
          AccountCustomerInterface,
          ButStudentInterface[],
          ButDocumentInterface[],
          EinrichtungInterface
        ]) => {
        this.settings = settings;
        this.customer = customer;
        this.registeredStudents = students;
        this.tenantStudent = tenantStudent;
        this.accountTenant = accountTenant;
        this.butStudents = butStudents
        this.documentsTenant = documentsBut
        this.schoolSetting = schoolSetting
        this.pageLoaded = true;
      },
      (error) => {
        console.error('An error occurred:', error);
        // Handle errors as needed.
      })
  }


  selectStudent(student: StudentInterfaceId | null) {
    this.submittingRequestFlip = true;
    this.selectedStudent = student;
    if (!student) {
      this.submittingRequestFlip = false;
      return
    }

    setTimeout(() => this.isFlipped = true, 50);

    const butStudent = this.butStudents.find((butStudent) => butStudent.studentId === student._id);
    if (!butStudent) {
      this.butExists = false
      this.selectedBut = new ButStudent(student);
    } else {
      this.butExists = true
      this.selectedBut = butStudent;
    }
    this.submittingRequestFlip = false;

  }

  hasBut(student: StudentInterfaceId) {
    if (!student.butFrom) {
      return false;
    }
    return true;
    // return this.permanentOrders.find((permanentOrder) => permanentOrder.studentId === student._id);
  }

  editOrAddBut(butStudent: ButStudentInterface) {
    this.submittingRequest = true;
    // if(noDayIsSelected(permanentOrder)){
    //   this.toastr.error(this.translate.instant('MANAGE_PERMANENT_ORDERS_ERROR_NO_DAY'))
    //   this.submittingRequest = false;
    //   return
    // }
    // const dialogRef = this.dialog.open(ConfirmDialogPermanetOrderComponent, {
    //   width: '550px',
    //   panelClass: 'custom-dialog-container',
    //   position: {top: '100px'}
    // });
    // dialogRef.afterClosed().subscribe((result:ExportCsvDialogData) => {
    //   if (!result){
    //     this.submittingRequest = false;
    //     return;
    //   }
    //   let routeId = permanentOrder._id ? 'editPermanentOrdersUser' : 'setPermanentOrdersUser';
    //   (this.permanentOrdersService as any)[routeId](permanentOrder).subscribe((response: any) => {
    //     if (!response.error) {
    //       this.submittingRequest = false;
    //       this.initAfterEdit()
    //     } else {
    //       this.toastr.error(this.translate.instant('MANAGE_PERMANENT_ORDERS_ERROR_SAVING'))
    //       this.submittingRequest = false
    //       this.isFlipped = false
    //     }
    //   });
    // });
  }

  back() {
    this.isFlipped = false
  }
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  setFileEmpty() {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
    this.base64String = '';
  }
  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.selectedFile = input.files[0];
  //     this.convertFileToBase64(this.selectedFile);
  //   }
  // }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];

      // Erlaubte MIME-Typen
      const allowedTypes: string[] = [
        'application/pdf',
        'image/jpeg',
        'image/png'
      ];

      // Prüfung, ob der MIME-Typ in allowedTypes enthalten ist
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Bitte nur PDF, JPG/JPEG oder PNG hochladen!', 'Falsches Format');
        return; // Beende die Funktion, um den Upload abzubrechen
      }

      this.selectedFile = file;
      this.convertFileToBase64(file);
    }
  }
  convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.base64String = reader.result;
    };
    reader.onerror = (error) => {
      console.error('Error converting file to base64: ', error);
    };
  }

  uploadFile(): void {
    if (this.selectedFile) {
      let base64 = this.base64String as string;
      if (!this.selectedStudent || !this.selectedStudent.tenantId || !this.selectedStudent.customerId || !this.selectedStudent.userId) {
        this.toastr.error('Bitte wählen Sie einen Schüler aus');
        return;
      }
      this.submittingRequest = true;
      let fileObject: ButDocumentInterface = {
        nameStudent: this.selectedStudent.firstName + ' ' + this.selectedStudent.lastName,
        username: this.tenantStudent.username,
        name: this.selectedFile.name,
        base64: base64,
        dateUploaded: new Date(),
        studentId: this.selectedStudent._id,
        tenantId: this.selectedStudent.tenantId,
        userId: this.selectedStudent.userId,
        customerId: this.selectedStudent.customerId,
        processed: false,
      };
      this.butService.uploadButDocument(fileObject).subscribe(
        (response: any) => {
          this.toastr.success(this.translate.instant('BUT.UPLOAD_SUCCESS'));
          this.setFileEmpty();
          forkJoin()
          this.butService.getButDocumentTenant().subscribe((documents: ButDocumentInterface[]) => {
            this.documentsTenant = documents;
            this.submittingRequest = false;
            this.isFlipped = false

          })
        },
        (error: any) => {
          this.submittingRequest = false;
          this.setFileEmpty();
          this.toastr.error(this.translate.instant('BUT.UPLOAD_ERROR'));
          console.error('Fehler beim Upload', error);
        }
      );
    } else {
      this.setFileEmpty();
      this.submittingRequest = false;
      this.toastr.error(this.translate.instant('BUT.NO_FILE_SELECTED'));
    }
  }


  async openFile(model: ButDocumentInterface) {
    this.submittingRequest = true;
    if (!model._id) {
      this.toastr.error(this.translate.instant('BUT.FILE_WRONG'));
      return
    }
    this.butService.getSingleButDocument({ _id: model._id }).subscribe(async (data: ButDocumentInterface) => {
      data.base64 = data.base64.split(',')[1];
      if (this.isApp) {
        await downloadPdfIos(data, this.fileOpener);
      } else {
        displayWebFunction(data);
      }
      this.submittingRequest = false;
    });
  }

  createWriting() {
    this.submittingRequestFlip = true;
    if (!this.selectedStudent || !this.tenantStudent) {
      this.toastr.warning('Es gab einen Fehler beim Erstellen des Schreibens');
      this.submittingRequestFlip = false;
      return;
    }

    let student = this.selectedStudent;
    let tenant = this.tenantStudent;
    let schoolSetting = this.schoolSetting;
    getBase64ImageFromUrl('../../../assets/logo.png')
      .then(logoBase64 => {
        let docDefinition = createPDF(
          student.firstName + ' ' + student.lastName,
          tenant.firstName + ' ' + tenant.lastName,
          getInvoiceDateOne(student.registerDate),
          schoolSetting?.nameCateringCompany + ', ' + schoolSetting?.streetCaterer + ', ' + schoolSetting?.zipcodeCaterer + ' ' + schoolSetting?.cityCaterer,
          schoolSetting?.nameEinrichtung + ', ' + schoolSetting?.streetCustomer + ', ' + schoolSetting?.zipcodeCustomer + ' ' + schoolSetting?.cityCustomer,
          student.username,
          'DE30 5107 0021 0980 5797 01',
          'DEUTDEFF510',
          'Cateringexpert Software Solutions GmbH',
          logoBase64,
        );

        const pdfDocGenerator = pdfMake.createPdf(docDefinition);

        if (this.isApp) {
          // Export the PDF as base64 to be used in the downloadPdfIos function
          pdfDocGenerator.getBase64(async (base64Data) => {
            const data: any = {
              base64: base64Data,
              name: 'Bestätigungsschreiben' + student.firstName + ' ' + student.lastName,
            };
            try {
              await downloadPdfIos(data, this.fileOpener);
            } catch (error) {
              console.error('Error opening PDF on iOS', error);
              this.toastr.error('Fehler beim Öffnen der PDF-Datei auf iOS');
            } finally {
              this.submittingRequestFlip = false;
            }
          });
        } else {
          // Web download
          pdfDocGenerator.download('Bestätigungsschreiben ' + student.firstName + '_' + student.lastName + '.pdf');
          this.submittingRequestFlip = false;
        }
      })
      .catch(error => {
        console.error('Error loading image: ', error);
        this.toastr.error('Fehler beim Laden des Logos');
        this.submittingRequestFlip = false;
      });
  }


}
