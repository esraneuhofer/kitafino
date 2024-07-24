import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export function createPDF(
  childName: string,
  registrationDate: string,
  mealCost: string,
  catererName: string,
  iban: string,
  bic: string,
  accountHolder: string,
  yourName: string,
  yourContactDetails: string
): void {
  const docDefinition:any = {
    content: [
      { text: 'Bestätigungsschreiben', style: 'header' },
      '\n\n',
      `Sehr geehrte Damen und Herren,`,
      '\n\n',
      `hiermit bestätige ich, dass das Kind ${childName} über unsere App bei dem Caterer ${catererName} Essen bestellt.`,
      '\n\n',
      `Die Anmeldung erfolgt zu ${registrationDate}.`,
      '\n\n',
      `Die Kosten pro Essen betragen ${mealCost}.`,
      '\n\n',
      `Wir möchten im Rahmen des Bildungs- und Teilhabeprogramms einen Antrag auf Unterstützung stellen. Bitte beachten Sie, dass die Zahlung des Essensgeldes auf folgendes Konto erfolgen soll:`,
      '\n\n',
      `Kontoinhaber: ${accountHolder}`,
      `\nIBAN: ${iban}`,
      `\nBIC: ${bic}`,
      '\n\n',
      `Für weitere Rückfragen stehe ich Ihnen gerne zur Verfügung.`,
      '\n\n',
      `Mit freundlichen Grüßen,`,
      '\n\n',
      `${yourName}`,
      `\n${yourContactDetails}`,
      '\n\n',
      `---`,
      '\n\n',
      `Ich "Cateringexpert" bestätige, dass das Kind ${childName} auf meiner App registriert ist, um beim Caterer ${catererName} Essen zu bestellen.`
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      }
    }
  };

  pdfMake.createPdf(docDefinition).download('Bestätigungsschreiben.pdf');
}
