import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {SettingInterfaceNew} from "../../classes/setting.class";
import {getInvoiceDateOne} from "../../functions/date.functions";
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export const footer: {
    footerLeft: {footerText:string}[],
    footerMiddle: {footerText:string}[],
    footerRight: {footerText:string}[]
  } = {
    footerLeft: [
      {footerText: 'Cateringexpert Software Solutions GmbH'},
      {footerText: 'Adelheitstrasse 74'},
      {footerText: '65185 Wiesbaden'},
    ],
    footerMiddle: [],
    footerRight: [
      {footerText:'www.cateringexpert.de'},
      {footerText: 'info@cateringexpert.de'},
      {footerText: 'Tel: 0800 - 5891360'}]

  }
export function createPDF(
  nameStudent: string,
  nameParent: string,
  dateRegistration: string,
  nameCateringService: string,
  nameEinrichtung: string,
  username: string,
  iban: string,
  bic: string,
  accountHolder: string,
  logoPath: string,
): void {
  const docDefinition:any = {
    header: {
      columns: [
        { text: '' },
        { image: logoPath, width: 90, alignment: 'right',margin: [0, 10, 10, 0] }
      ],
      margin: [0, 0, 0, 40] // Abstand zwischen Header und Inhalt
    },
    content: [
      { text: 'Bestätigungsschreiben', style: 'header' },
      '\n\n',
      { text: 'Sehr geehrte Damen und Herren,', style: 'content' },
      '\n\n',
      { text: `Hiermit bestätigen wir „Cateringexpert Software Solutions GmbH“ die Anmeldung des Verpflegungsteilnehmers ${nameStudent} durch ${nameParent} am ${dateRegistration} für die Mittagsverpflegung bei dem Caterer ${nameCateringService}.`, style: 'content' },
      '\n\n',
      { text: `Der Essenlieferung erfolgt für die Einrichtung ${nameEinrichtung}.`, style: 'content' },
      '\n\n',
      { text: 'Die Abwicklung der Zahlung der Mittagessen für den Caterer erfolgt über unsere Plattform.', style: 'content' },
      '\n\n',
      { text: `Damit die Freischaltung der Bestellung für die Mittagsverpflegung erfolgen kann, müssten die Zahlungen des Essensgeldes auf unser Konto erfolgen.`, style: 'content' },
      { text: `Für eine eindeutige Zuordnung des Essensgeldes soll folgender Benutzername im Verwendungszweck enthalten sein: ${username}.`, style: 'content' },
      '\n',
      { text: `Erst nach Eingang der Bestätigung kann die kostenübernahme eingestellt werden`, style: 'content' },
      '\n\n',
      { text: 'Die Zahlungen für die Essenverpflegung bitte auf das folgende Konto überweisen:', style: 'content' },
      '\n\n',
      { text: `Kontoinhaber: ${accountHolder}`, style: 'content' },
      { text: `IBAN: ${iban}`, style: 'content' },
      { text: `BIC: ${bic}`, style: 'content' },
      '\n\n',
      { text: `Dieses Schreiben wurde am ${getInvoiceDateOne(new Date())} aus unserem System erstellt und ist auch ohne Unterschrift gültig.`, style: 'content' },
      '\n\n',
      { text: `Mit freundlichen Grüßen`, style: 'content' },
      '\n',
      { text: `Esra Neuhofer`, style: 'content' },
    ],
    footer: function (currentPage:any, pageCount:any) {
      return getFooterColumns(currentPage, pageCount, footer);
    },
    styles: {
      header: {
        fontSize: 13,
        bold: true,
        margin: [0, 60, 0, 10]
      },

      documentFooterLeft: {
        fontSize: 10,
        margin: [25, -15, 5, 5],
        alignment: 'left'
      },content: {
        fontSize: 11
      },
      documentFooterCenter: {
        fontSize: 10,
        margin: [5, -15, 5, 5],
        alignment: 'center'
      },
      documentFooterRight: {
        fontSize: 10,
        margin: [5, -15, 25, 5],
        alignment: 'right'
      },
    }
  };

  pdfMake.createPdf(docDefinition).download('Bestätigungsschreiben.pdf');
}

export function getFooterColumns(currentPage:number, pageCount:number, footer:any) {
  let arr = [];
  arr.push({text: getTextFooter('footerLeft', currentPage, pageCount, footer), style: 'documentFooterLeft'});
  arr.push({text: getTextFooter('footerMiddle', currentPage, pageCount, footer), style: 'documentFooterCenter'});
  arr.push({text: getTextFooter('footerRight', currentPage, pageCount, footer), style: 'documentFooterRight'});
  return {
    columns: arr
  };
}

export function getTextFooter(text:string, currentPage:number, pageCount:number, footer:any) {
  let string:any = '';
  if (!footer || !footer[text]) {
    return '';
  }
  footer[text].forEach((each:any) => {
    string += each.footerText + '\n';
  });
  if (text === 'footerMiddle') {
    string += '\nSeite ' + currentPage + ' von ' + pageCount;
  }
  return string;
}
// Beispielaufruf der Funktion

export function getBase64ImageFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      let canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx:any = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = error => {
      reject(error);
    };
    img.src = url;
  });
}
