import {Component, OnInit} from '@angular/core';
import {GenerellService} from "../../service/generell.service";
import {CustomerInterface} from "../../classes/customer.class";
import {getWeekNumber} from "../order-student/order.functions";
import {getCalenderQuery, getYearsQuery} from "../order-student/date-selection/date-selection.functions";
import {forkJoin} from "rxjs";
import {PlatformService} from "../../service/platform.service";
import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";
import {displayWebFunction} from "./display-web.function";
import {downloadPdfWeb} from "./download-web.function";
// import {downloadPdfIos} from "./download-ios.function";
import { Browser } from '@capacitor/browser';

function isInGroups(group:string[],customerId:string){
  for(let i = 0; i < group.length; i++){
    if(group[i] === customerId)return true;
  }
  return false;
}
export interface WeekplanPdfInterface {
  _id:string,
  tenantId:string,
  calenderWeek:number,
  year:number,
  groups:string[],
  name:string,
  base64:string
}

@Component({
  selector: 'app-weekplan-pdf',
  templateUrl: './weekplan-pdf.component.html',
  styleUrls: ['./weekplan-pdf.component.scss']
})
export class WeekplanPdfComponent implements OnInit{

  pageLoaded = false;
  queryYear:number = new Date().getFullYear();
  queryWeek:number = getWeekNumber(new Date())
  queryCalenderWeek:{ value: string; week: number }[] =[];
  generatedKWArray: { value: string; week: number }[][] = [];
  queryYears: { year: number; index: number }[] = [];

  selectedIndexYear:number = 1;

  page: number = 1;
  pageSize: number = 12;
  allWeekplans:WeekplanPdfInterface[] = [];
  customerInfo!:CustomerInterface;
  submittingRequest = false;
  constructor(private generellService:GenerellService,
              private platformService: PlatformService) { }
  isApp:boolean = false;



  ngOnInit() {
    this.isApp = this.platformService.isIos || this.platformService.isAndroid
    this.queryYears = getYearsQuery();
    this.generatedKWArray = getCalenderQuery(new Date().getFullYear());
    this.queryCalenderWeek = this.generatedKWArray[this.selectedIndexYear]; //Selects Calenderquery Array to current Year
    forkJoin([
      this.generellService.getCustomerInfo(),
      this.generellService.getWeekplanPdfWeek({year:this.queryYear,week:this.queryWeek})
    ]).subscribe(([customerInfo,weekplansWeek]:[CustomerInterface,WeekplanPdfInterface[]]) => {
      this.customerInfo = customerInfo;
      this.allWeekplans = this.getWeekplanQuery(weekplansWeek, this.customerInfo);
      this.pageLoaded = true;
    })
  }

  getWeekplanQuery(weekplans:WeekplanPdfInterface[],customer:CustomerInterface){
    let arr:WeekplanPdfInterface[] = [];
    weekplans.forEach(eachWeekplan =>{
      if(eachWeekplan.groups && (eachWeekplan.groups.length === 0 || isInGroups(eachWeekplan.groups,customer.customerId))){
        arr.push(eachWeekplan);
      }
    })
    return arr;
  };
  async displayTest(model: { _id: string }) {
    // PDF-Daten von der Datenbank abrufen
    this.generellService.getSingelWeekplanPdf({ _id: model._id }).subscribe(async (data: WeekplanPdfInterface) => {
      const pdfBase64 = data.base64.replace(/\s/g, ''); // Entferne Leerzeichen und Zeilenumbrüche

      // Protokollieren des Base64-Strings
      console.log('Base64 PDF:', pdfBase64);

      // PDF-Daten in ein Blob-Objekt umwandeln
      const pdfBlob = this.base64ToBlob(pdfBase64, 'application/pdf');

      // Protokollieren des Blob-Objekts
      console.log('PDF Blob:', pdfBlob);

      // Blob-Objekt in eine URL umwandeln
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Überprüfen, ob die URL korrekt ist
      console.log('Generated PDF URL:', pdfUrl);

      // PDF im Browser öffnen
      const options = {
        url: pdfUrl,
      };
      await Browser.open(options)
        .then(data => {
          console.log('PDF opened:', data);
        })
        .catch(error => {
          console.error('Error opening the PDF URL in the browser:', error);
        });
    }, error => {
      console.error('Error fetching PDF data:', error);
    });
  }

  // Hilfsfunktion: Base64-String in ein Blob-Objekt umwandeln
  base64ToBlob(base64: string, contentType: string = '', sliceSize: number = 512): Blob {
    try {
      const byteCharacters = atob(base64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: contentType });
      console.log('Blob created:', blob); // Protokollieren des erstellten Blobs
      return blob;
    } catch (error) {
      console.error('Error creating blob from Base64:', error);
      return new Blob(); // Rückgabe eines leeren Blobs im Fehlerfall
    }
  }


  async downloadPdf(model: WeekplanPdfInterface) {
    this.submittingRequest = true;
    this.generellService.getSingelWeekplanPdf({ _id: model._id }).subscribe(async (data: WeekplanPdfInterface) => {
      if (this.isApp) {
        // await downloadPdfIos(data, this.fileOpener);
      } else {
        downloadPdfWeb(data);
      }

      this.submittingRequest = false;
    });
  }


  displayPdf (model:WeekplanPdfInterface) {
    this.submittingRequest = true;
    this.generellService.getSingelWeekplanPdf({_id: model._id}).subscribe((data:WeekplanPdfInterface) => {
      if (!this.isApp) {
        displayWebFunction(data);
      } else {

      }
      this.submittingRequest = false;
    })
  };

  getWeekplanCalenderWeek(week:number,year:number){
    this.submittingRequest = true;
    this.generellService.getWeekplanPdfWeek({year:year,week:week}).subscribe((weekplansWeek:WeekplanPdfInterface[]) => {
      this.allWeekplans = this.getWeekplanQuery(weekplansWeek, this.customerInfo);
      this.submittingRequest = false;
    })
  }
  getWeekplanCalenderYear(year:number){
    this.submittingRequest = true;
    for(var i = 0; i < this.queryYears.length; i++){
      if(this.queryYears[i].year === year){
        this.selectedIndexYear = i;
      }
    }
    this.queryYear = year;
    this.queryCalenderWeek = this.generatedKWArray[this.selectedIndexYear];
    this.queryWeek = this.generatedKWArray[this.selectedIndexYear][0].week;
    this.generellService.getWeekplanPdfWeek({year:this.queryYear,week:this.queryWeek}).subscribe((weekplansWeek:WeekplanPdfInterface[]) => {
      this.allWeekplans = this.getWeekplanQuery(weekplansWeek, this.customerInfo);
      this.submittingRequest = false;
    })
  }
}
