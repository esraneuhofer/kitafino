import { Component, OnInit } from '@angular/core';
import { LanguageService } from "./service/language.service";
import { ApiService } from "./service/api.service";
import { environment } from "../environments/environment";
import { ToastingService } from "./service/toastr.service";
import { SplashScreen } from '@capacitor/splash-screen';
import {Platform} from "@ionic/angular";
import { App } from '@capacitor/app';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private toastrService: ToastingService,
              private platform: Platform,
              private router: Router,
              private languageService: LanguageService,
              private apiService: ApiService) {

    // console.log(`Environment API Base URL: ${environment.apiBaseUrl}`);  // Log the environment variable directly
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.handleDeepLinks();
    });
  }
  handleDeepLinks() {
    App.addListener('appUrlOpen', (data: any) => {
      const slug = data.url.split('://')[1];
      if (slug) {
        this.router.navigateByUrl('/' + slug);
      }
    });
  }
  switchLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }

  ngOnInit() {
    this.apiService.setLanguage({ lang: 'en' }).subscribe(
      data => {
        // console.log('Data received in component:', data);
      },
      error => {
        // console.error('Error in component:', error);
      }
    );
  }


}
