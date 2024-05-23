import {Component} from "@angular/core";
import {LanguageService} from "../service/language.service";

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})

export class AuthenticationComponent {
  constructor(private languageService: LanguageService) {
  }
  switchLanguage(language: string): void {
    console.log(language);
    this.languageService.setLanguage(language);
  }
}
