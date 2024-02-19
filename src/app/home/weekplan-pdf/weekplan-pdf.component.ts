import {Component, OnInit} from '@angular/core';
import {GenerellService} from "../../service/generell.service";
import {CustomerInterface} from "../../classes/customer.class";
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
  page: number = 1;
  pageSize: number = 12;
  allWeekplans:WeekplanPdfInterface[] = [];
  customerInfo!:CustomerInterface;
  constructor(private generellService:GenerellService) { }

  ngOnInit() {
    this.generellService.getCustomerInfo().subscribe((data:CustomerInterface) => {
      this.customerInfo = data;
      this.getWeekplans(new Date().getFullYear())
    })
  }
  getWeekplans(year:number) {
    this.generellService.getAllWeekplanPdf({year:year}).subscribe((data:WeekplanPdfInterface[]) => {
      this.allWeekplans = this.getWeekplanQuery(data,this.customerInfo);
      this.pageLoaded = true;
    })

  }
  getWeekplanQuery(weekplans:WeekplanPdfInterface[],customer:CustomerInterface){
    let arr:WeekplanPdfInterface[] = [];
    console.log(weekplans);
    console.log(customer);
    weekplans.forEach(eachWeekplan =>{
      if(eachWeekplan.groups && (eachWeekplan.groups.length === 0 || isInGroups(eachWeekplan.groups,customer.customerId))){
        arr.push(eachWeekplan);
      }
    })
    return arr;
  };
  downloadPdf(model:WeekplanPdfInterface) {
    this.generellService.getSingelWeekplanPdf({_id: model._id}).subscribe((data:WeekplanPdfInterface) => {
      var link = document.createElement('a');
      link.download = data.name;
      var uri = 'data:application/pdf;base64, ' + data.base64;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
  displayPdf (model:WeekplanPdfInterface) {
    this.generellService.getSingelWeekplanPdf({_id: model._id}).subscribe((data:WeekplanPdfInterface) => {
      console.log(data);
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
      }
    })
  };
}
