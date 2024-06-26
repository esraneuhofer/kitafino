import { Component, OnInit } from '@angular/core';
import { LanguageService } from "./service/language.service";
import { ApiService } from "./service/api.service";
import { environment } from "../environments/environment";
import { ToastingService } from "./service/toastr.service";
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private toastrService: ToastingService,
              private languageService: LanguageService,
              private apiService: ApiService) {
    // console.log(`Environment API Base URL: ${environment.apiBaseUrl}`);  // Log the environment variable directly
  }

  switchLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }

  ngOnInit() {
    this.initializeApp();
    this.apiService.setLanguage({ lang: 'en' }).subscribe(
      data => {
        // console.log('Data received in component:', data);
      },
      error => {
        // console.error('Error in component:', error);
      }
    );
  }

  async initializeApp() {
    // Show the splash for an indefinite amount of time initially
    await SplashScreen.show({
      autoHide: false,
    });

    // Optional: Any other initialization logic can go here

    // Hide the splash after your initialization logic is done
    await SplashScreen.hide();

    // If you need to show the splash screen again later, use this method:
    // await SplashScreen.show({
    //   showDuration: 2000,
    //   autoHide: true,
    // });
  }
}
