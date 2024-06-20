import {Component, OnInit} from '@angular/core';
import {GenerellService} from "../../service/generell.service";
import {CustomerInterface} from "../../classes/customer.class";
import {getWeekNumber} from "../order-student/order.functions";
import {getCalenderQuery, getYearsQuery} from "../order-student/date-selection/date-selection.functions";
import {forkJoin} from "rxjs";
import {PlatformService} from "../../service/platform.service";
import {displayWebFunction} from "./display-web.function";
import {downloadPdfWeb} from "./download-web.function";
import { Browser } from '@capacitor/browser';
import {HelpService} from "../../service/help.service";

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
              private helpService:HelpService,
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
  // async displayTest() {
  //   this.submittingRequest = true;
  //   const pdf_url = 'https://nittaiori.github.io/IonicPdf/pdf_test.pdf';
  //   const options = {
  //     url: pdf_url,
  //   };
  //   await Browser.open(options)
  //     .then(data => {
  //       // this.submittingRequest = false;
  //
  //       console.log(data);
  //     })
  //     .catch(error => {
  //       // this.submittingRequest = false;
  //       alert(error)
  //       console.error(error);
  //     });
  // }
  async displayTest(model: any) {
    this.submittingRequest = true;

    try {
      const data = await this.generellService.getSingelWeekplanPdf({ _id: model._id }).toPromise();
      console.log(data);

      if (data && data.base64) {
        const pdfBase64 = data.base64;
        const pdfBlob = this.base64ToBlob(pdfBase64, 'application/pdf');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const options = {
          url: pdfUrl,
        };
        console.log(options);
        await Browser.open(options);

        // URL-Objekt freigeben, wenn es nicht mehr benötigt wird
        URL.revokeObjectURL(pdfUrl);
      } else {
        console.error('Kein PDF erhalten');
        alert('Kein PDF erhalten');
      }
    } catch (error) {
      console.error('Fehler beim Öffnen des PDFs:', error);
      alert('Fehler beim Öffnen des PDFs: ' + error);
    } finally {
      this.submittingRequest = false;
    }
  }

// Hilfsfunktion, um Base64-String in ein Blob-Objekt zu konvertieren
  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    console.log("byteArrays");
    console.log(byteArrays);
    return new Blob(byteArrays, { type: contentType });
  }
  async downloadPdf(id: string) {
    this.helpService.downloadHelpPdf(id).subscribe(
      (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
        // Optional: URL-Revoke, um Speicher freizugeben, wenn der Blob nicht mehr benötigt wird.
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      },
      (error) => {
        console.error('Download error', error);
      }
    );
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
