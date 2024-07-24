import {WeekplanPdfInterface} from "./weekplan-pdf.component";
import {ButDocumentInterface} from "../../classes/but.class";

export function  downloadPdfWeb(data:WeekplanPdfInterface | ButDocumentInterface,nameFile:string) {
  let link = document.createElement('a');
  link.download = data.name;
  let uri = 'data:application/pdf;base64, ' + data.base64;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
    // console.log(data);
    // // Convert Base64 to a Blob
    // const byteCharacters = atob(data.base64);
    // const byteNumbers = new Array(byteCharacters.length);
    // for (let i = 0; i < byteCharacters.length; i++) {
    //   byteNumbers[i] = byteCharacters.charCodeAt(i);
    // }
    // const byteArray = new Uint8Array(byteNumbers);
    // const blob = new Blob([byteArray], { type: 'application/pdf' });
    //
    // // Create a URL for the Blob object
    // const blobUrl = URL.createObjectURL(blob);
    //
    // // Check if running in iOS WebView
    // const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // const isInStandaloneMode = ('standalone' in navigator) && (navigator as any).standalone;
    //
    // if (isIOS && isInStandaloneMode) {
    //   // If in iOS standalone mode, open the Blob URL in a new window
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     const url = reader.result as string;
    //     const newWindow = window.open(url, '_blank');
    //     if (!newWindow) {
    //       console.error('Failed to open new window');
    //     }
    //   };
    //   reader.readAsDataURL(blob);
    // } else {
    //   // Create a link and trigger the download
    //   const link = document.createElement('a');
    //   link.download = nameFile;
    //   link.href = blobUrl;
    //   document.body.appendChild(link);
    //   link.click();
    //
    //   // Clean up by removing the link and revoking the Blob URL
    //   document.body.removeChild(link);
    //   URL.revokeObjectURL(blobUrl);
    // }

}

