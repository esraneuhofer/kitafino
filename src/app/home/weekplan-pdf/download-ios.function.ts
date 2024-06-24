import { WeekplanPdfInterface } from './weekplan-pdf.component';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import {HelpPdfInterface} from "../../service/help.service";

export async function downloadPdfIos(data: WeekplanPdfInterface, fileOpener: FileOpener): Promise<void> {
  const pdfBase64 = data.base64;
  const fileName = `${data.name}.pdf`;

  try {
    await Filesystem.writeFile({
      path: fileName,
      data: pdfBase64,
      directory: Directory.Documents
    });

    const getUriResult = await Filesystem.getUri({
      directory: Directory.Documents,
      path: fileName
    });

    const path = getUriResult.uri;
    await fileOpener.open(path, 'application/pdf')
      .then(() => console.log('File is opened'))
      .catch(error => alert('Error opening file'));
  } catch (error) {
    alert(error);
    console.error('Unable to write file', error);
  }
}

export async function downloadPdfHelpIos(data: HelpPdfInterface, fileOpener: FileOpener): Promise<void> {
  const pdfBase64 = data.base64;
  const fileName = `${data.nameFile}.pdf`;
  try {
    await Filesystem.writeFile({
      path: fileName,
      data: pdfBase64,
      directory: Directory.Documents
    });

    const getUriResult = await Filesystem.getUri({
      directory: Directory.Documents,
      path: fileName
    });

    const path = getUriResult.uri;
    await fileOpener.open(path, 'application/pdf')
      .then(() => console.log('File is opened'))
      .catch(error => console.error('Error opening file', error));
  } catch (error) {
    console.error('Unable to write file', error);
  }
}
