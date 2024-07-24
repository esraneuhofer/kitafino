import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

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
  logoUrl: string,
  yourName: string,
  yourContactDetails: string
): void {
  const docDefinition:any = {
    header: {
      columns: [
        { text: '' },
        { image: logoUrl, width: 150, alignment: 'right' }
      ]
    },
    content: [
      { text: 'Bestätigungsschreiben', style: 'header' },
      '\n\n',
      `Sehr geehrte Damen und Herren,`,
      '\n\n',
      `Hiermit bestätigen wir „Cateringexpert Software Solutions GmbH“ die Anmeldung des Verpflegungsteilnehmers ${nameStudent} durch ${nameParent} am ${dateRegistration} für die Mittagsverpflegung bei dem Caterer ${nameCateringService}.`,
      '\n\n',
      `Der Essenlieferung erfolgt für die Einrichtung ${nameEinrichtung}.`,
      '\n\n',
      `Die Abwicklung der Zahlung der Mittagessen für den Caterer erfolgt über unsere Plattform.`,
      '\n\n',
      `Damit die Freischaltung der Bestellung für die Mittagsverpflegung erfolgen kann, müssten die Zahlungen des Essensgeldes auf unser Konto erfolgen.`,
      `\nFür eine eindeutige Zuordnung des Essensgeldes soll folgender Benutzername im Verwendungszweck enthalten sein: ${username}.`,
      '\n\n',
      `Die Zahlungen für die Essenverpflegung bitte auf das folgende Konto überweisen:`,
      '\n\n',
      `Kontoinhaber: ${accountHolder}`,
      `\nIBAN: ${iban}`,
      `\nBIC: ${bic}`,
      '\n\n',
      `Dieses Schreiben wurde aus unserem System erstellt und ist auch ohne Unterschrift gültig.`,
    ],
    footer: function (currentPage:any, pageCount:any) {
      return getFooterColumns(currentPage, pageCount, {
        footerLeft: 'Left footer text',
        footerMiddle: `Seite ${currentPage} von ${pageCount}`,
        footerRight: 'Right footer text'
      });
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      documentFooterLeft: {
        alignment: 'left'
      },
      documentFooterCenter: {
        alignment: 'center'
      },
      documentFooterRight: {
        alignment: 'right'
      }
    }
  };

  pdfMake.createPdf(docDefinition).download('Bestätigungsschreiben.pdf');
}

function getFooterColumns(currentPage: number, pageCount: number, footer: any) {
  let arr = [];
  arr.push({ text: footer.footerLeft, style: 'documentFooterLeft' });
  arr.push({ text: footer.footerMiddle, style: 'documentFooterCenter' });
  arr.push({ text: footer.footerRight, style: 'documentFooterRight' });
  return {
    columns: arr
  };
}

// Beispielaufruf der Funktion

