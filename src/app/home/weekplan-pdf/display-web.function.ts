import {WeekplanPdfInterface} from "./weekplan-pdf.component";
import {ButDocumentInterface} from "../../classes/but.class";

export function displayWebFunction(data:WeekplanPdfInterface | ButDocumentInterface): void {
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
}
