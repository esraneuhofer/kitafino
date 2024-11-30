
import {getInvoiceDateOne} from "../../functions/date.functions";

const footerCateringexpert: {
    footerLeft: {footerText:string}[],
    footerMiddle: {footerText:string}[],
    footerRight: {footerText:string}[]
  } = {
    footerLeft: [
      {footerText: 'Cateringexpert Software Solutions GmbH'},
      {footerText: 'Adelheitstrasse 74'},
      {footerText: '65185 Wiesbaden'},
    ],
    footerMiddle: [
      {footerText: 'Deutsche Bank'},
      {footerText: 'IBAN:DE57 5107 0021 0980 5797 00'},
      {footerText: 'BIC:DEUTDEFF510'},
      {footerText: 'USt-IdNr: DE366961599'},
    ],

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
):any {
 return  {
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
      {
        text: [
          `Hiermit bestätigen wir der „Cateringexpert Software Solutions GmbH“ die Anmeldung des Verpflegungsteilnehmers / der Verpflegungsteilnehmerin: `,
          { text: `${nameStudent}`, bold: true },
          ` durch `,
          { text: `${nameParent}`, bold: true },
          ` am `,
          { text: `${dateRegistration}`, bold: true },
          ` für die Mittagsverpflegung bei dem Caterer ${nameCateringService}.`
        ],
        style: 'content'
      },
      '\n\n',
      { text: `Die Essenslieferung erfolgt für die Einrichtung ${nameEinrichtung}.`, style: 'content' },
      '\n\n',
      { text: 'Die Abwicklung der Zahlungen für das Mittagessen des Caterers erfolgt über unsere Plattform.', style: 'content' },
      '\n\n',
      { text: `Damit die Freischaltung der Bestellung für die Mittagsverpflegung erfolgen kann, bitten wir um die Überweisung des Essensgeldes auf unser unten genanntes Konto.`, style: 'content' },
      { text: `Bitte geben Sie im Verwendungszweck unbedingt den folgenden Benutzernamen an, damit die Zahlung korrekt zugeordnet werden kann`, style: 'content' },
      '\n',
      { text: `Der Benutzername für den Verpflegungsteilnehmers / der Verpflegungsteilnehmerin lautet:`, style: 'content' },
      { text: `${username}`, style: 'content',bold: true },

      '\n\n',
      { text: 'Die Zahlungen für die Essensverpflegung bitte auf das folgende Konto überweisen:', style: 'content' },
      '\n\n',

      {text:[{ text: `Kontoinhaber:`, bold: true },{ text: ` ${accountHolder}`, style: 'content' }]},
      {text:[  { text: `IBAN:`, bold: true },
          { text: ` ${iban}`, style: 'content' },]},
      {text:[ { text: `BIC:`, bold: true },
          { text: ` ${bic}`, style: 'content' },]},


      '\n\n',
      { text: `Dieses Schreiben wurde am ${getInvoiceDateOne(new Date())} aus unserem System erstellt und ist auch ohne Unterschrift gültig.`, style: 'content' },
      '\n\n',
      { text: `Mit freundlichen Grüßen`, style: 'content' },
      '\n',
      { text: `Esra Neuhofer\nGeschäftsführer`, style: 'content' },
      // '\n',
      // { text: `Geschäftsführer`, style: 'content' },
    ],
    footer: function (currentPage:any, pageCount:any) {
      return getFooterColumns(currentPage, pageCount, footerCateringexpert);
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


}

function getFooterColumns(currentPage:number, pageCount:number, footer:any) {
  let arr = [];
  arr.push({text: getTextFooter('footerLeft', currentPage, pageCount, footer), style: 'documentFooterLeft'});
  arr.push({text: getTextFooter('footerMiddle', currentPage, pageCount, footer), style: 'documentFooterCenter'});
  arr.push({text: getTextFooter('footerRight', currentPage, pageCount, footer), style: 'documentFooterRight'});
  return {
    columns: arr
  };
}

function getTextFooter(text:string, currentPage:number, pageCount:number, footer:any) {
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
