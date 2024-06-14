import {Component, OnInit} from '@angular/core';
import {LanguageService} from "./service/language.service";
import {ApiService} from "./service/api.service";
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(private languageService: LanguageService,private apiService: ApiService) {
    console.log(`Environment API Base URL: ${environment.apiBaseUrl}`);  // Log the environment variable directly
  }

  switchLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }
  ngOnInit() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/ngsw-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
    this.apiService.setLanguage({lang:'en'}).subscribe(
      data => {
        console.log('Data received in component:', data);
      },
      error => {
        console.error('Error in component:', error);
      }
    );
  }
}
