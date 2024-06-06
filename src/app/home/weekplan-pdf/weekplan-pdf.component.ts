import {Component, OnInit} from '@angular/core';
import {GenerellService} from "../../service/generell.service";
import {CustomerInterface} from "../../classes/customer.class";
import {getWeekNumber} from "../order-student/order.functions";
import {getCalenderQuery, getYearsQuery} from "../order-student/date-selection/date-selection.functions";
import {forkJoin} from "rxjs";


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
  constructor(private generellService:GenerellService) { }
  isSafari:boolean = false;

  checkIfSafariOrIOSApp(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

    // Check if running in a standalone mode (PWA) on iOS
    const isInStandaloneMode = (navigator as any).standalone === true;

    // Check if running in an iOS WebView (Capacitor)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isIOSWebView = isIOS && !isSafari && !isInStandaloneMode;

    return isSafari || isInStandaloneMode || isIOSWebView;
  }


  ngOnInit() {
    this.isSafari = this.checkIfSafariOrIOSApp();
    this.queryYears = getYearsQuery();
    this.generatedKWArray = getCalenderQuery(new Date().getFullYear());
    this.queryCalenderWeek = this.generatedKWArray[this.selectedIndexYear]; //Selects Calenderquery Array to current Year
    forkJoin([
      this.generellService.getCustomerInfo(),
      this.generellService.getWeekplanPdfWeek({year:this.queryYear,week:this.queryWeek})
    ]).subscribe(([customerInfo,weekplansWeek]:[CustomerInterface,WeekplanPdfInterface[]]) => {
      this.customerInfo = customerInfo;
      console.log(weekplansWeek);
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
  downloadPdf(model: WeekplanPdfInterface) {
    this.submittingRequest = true;
    this.generellService.getSingelWeekplanPdf({_id: model._id}).subscribe((data: WeekplanPdfInterface) => {
      // Convert Base64 to a Blob
      const byteCharacters = atob(data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create a URL for the Blob object
      const blobUrl = URL.createObjectURL(blob);

      // Check if running in iOS WebView
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isInStandaloneMode = ('standalone' in navigator) && (navigator as any).standalone;

      if (isIOS && isInStandaloneMode) {
        // If in iOS standalone mode, open the Blob URL in a new window
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = reader.result as string;
          const newWindow = window.open(url, '_blank');
          if (!newWindow) {
            console.error('Failed to open new window');
          }
        };
        reader.readAsDataURL(blob);
      } else {
        // Create a link and trigger the download
        const link = document.createElement('a');
        link.download = data.name;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();

        // Clean up by removing the link and revoking the Blob URL
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }

      this.submittingRequest = false;
    });
  }






  displayPdf (model:WeekplanPdfInterface) {
    this.submittingRequest = true;
    this.generellService.getSingelWeekplanPdf({_id: model._id}).subscribe((data:WeekplanPdfInterface) => {
      if (/msie\s|trident\/|edge\//i.test(window.navigator.userAgent)) {
        // Cast navigator to any to bypass TypeScript checks
        const navigatorAny: any = window.navigator;
        if (navigatorAny.msSaveOrOpenBlob) {
          // Your existing code here
          var byteCharacters = atob(data.base64);
          var byteNumbers = new Array(byteCharacters.length);
          for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          var byteArray = new Uint8Array(byteNumbers);

          var blob = new Blob([byteArray], {type: 'application/pdf'});
          this.submittingRequest = false;
          navigatorAny.msSaveOrOpenBlob(blob, data.name);
        }
      }else{
        var x:any = window.open();
        x.document.open();
        var imgData ='data:application/pdf;base64, '+data.base64;
        var iframe = "<iframe width='100%' height='100%' src='" + imgData + "'></iframe>";
        // vm.loadingPdf = false;
        x.document.write(iframe);
        x.document.close();
        this.submittingRequest = false;

      }
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
