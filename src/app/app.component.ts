import {Component, OnInit} from '@angular/core';
import {LanguageService} from "./service/language.service";
import {ApiService} from "./service/api.service";
import {environment} from "../environments/environment";
import {ToastingService} from "./service/toastr.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(private toastrService: ToastingService,
              private languageService: LanguageService,private apiService: ApiService) {
    // console.log(`Environment API Base URL: ${environment.apiBaseUrl}`);  // Log the environment variable directly
  }

  switchLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }
  ngOnInit() {
    // this.toastrService.show('Successfully saved!', 'Anyone with a link can now view this file.', 'success');
    // this.toastrService.show('Error!', 'An error occurred.', 'error');
    // this.toastrService.show('Warning!', 'This is a warning message.', 'warning');
    // this.toastrService.show('Information!', 'This is an informational message.', 'info');
    // if ('serviceWorker' in navigator) {
    //   window.addEventListener('load', () => {
    //     navigator.serviceWorker.register('/ngsw-worker.js')
    //       .then(registration => {
    //         console.log('Service Worker registered with scope:', registration.scope);
    //         console.log('Service Worker registration successful:', registration);
    //       })
    //       .catch(error => {
    //         console.error('Service Worker registration failed:', error);
    //       });
    //   });
    // }
    this.apiService.setLanguage({lang:'en'}).subscribe(
      data => {
        // console.log('Data received in component:', data);
      },
      error => {
        // console.error('Error in component:', error);
      }
    );
  }
}
