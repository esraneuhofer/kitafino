import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../../environments/environment";
import {HelpService} from "../../service/help.service";
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  selectedFile: File | null = null;

  infoModelKita = {
    nameFile: '',
    lang: 'de',
    filename: '',
    routeName: ''
  };

  constructor(private http: HttpClient,private helpService:HelpService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('pdf', this.selectedFile, this.selectedFile.name);
      formData.append('nameFile', this.infoModelKita.nameFile);
      formData.append('lang', this.infoModelKita.lang);
      formData.append('filename', this.infoModelKita.filename);
      formData.append('routeName', this.infoModelKita.routeName);

      this.helpService.uploadHelpPdf(formData).subscribe(
        (response) => {
          console.log('Upload successful', response);
        },
        (error) => {
          console.error('Upload error', error);
        }
      );
    } else {
      alert('Please select a file first');
    }
  }
}
