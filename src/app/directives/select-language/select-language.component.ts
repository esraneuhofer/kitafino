import {Component, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {GenerellService} from "../../service/generell.service";
import {lang} from "moment-timezone";
import {LanguageService} from "../../service/language.service";
const languagesConst: LanguageSelect[] = [
  { id: 1, name: 'Deutsch', avatar: 'https://flagcdn.com/w320/de.png', code: 'de' },  // Germany flag
  { id: 2, name: 'Türkçe', avatar: 'https://flagcdn.com/w320/tr.png', code: 'tr' },  // Turkey flag
  { id: 3, name: 'English', avatar: 'https://flagcdn.com/w320/gb.png', code: 'en' },  // UK flag
  { id: 4, name: 'العربية (Arabic)', avatar: 'https://flagcdn.com/w320/sa.png', code: 'ar' },  // Saudi Arabia flag (representing Arabic countries)
  { id: 5, name: 'Polski', avatar: 'https://flagcdn.com/w320/pl.png', code: 'pl' },  // Poland flag
  { id: 6, name: 'Русский (Russian)', avatar: 'https://flagcdn.com/w320/ru.png', code: 'ru' },  // Russia flag
  { id: 7, name: 'Italiano', avatar: 'https://flagcdn.com/w320/it.png', code: 'it' },  // Italy flag
  { id: 8, name: 'Ελληνικά (Greek)', avatar: 'https://flagcdn.com/w320/gr.png', code: 'el' },  // Greece flag
  { id: 9, name: 'Español', avatar: 'https://flagcdn.com/w320/es.png', code: 'es' },  // Spain flag
  { id: 10, name: 'Română', avatar: 'https://flagcdn.com/w320/ro.png', code: 'ro' },  // Romania flag
  { id: 11, name: 'Nederlands', avatar: 'https://flagcdn.com/w320/nl.png', code: 'nl' }  // Netherlands flag
];
interface LanguageSelect{id:number,name:string,avatar:string,code:string}
@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
  styleUrls: ['./select-language.component.scss']
})
export class SelectLanguageComponent {
  currentLanguage: string = 'de'
  languages:LanguageSelect[] = languagesConst;
  selectedLanguage:LanguageSelect = this.languages[0];
  isOpen = false;

  @Input() labelHidden = false;


  constructor(private translate: TranslateService,
              private generellService: GenerellService,
              private eRef: ElementRef,
              private languageService: LanguageService,
              private http: HttpClient) {
    // Set the initial language from sessionStorage or localStorage
    this.currentLanguage = sessionStorage.getItem('language') || localStorage.getItem('language') || 'de';
    this.translate.use(this.currentLanguage);

    // Set the selected person based on the current language
    this.selectedLanguage = this.languages.find(person => person.code === this.currentLanguage) || this.languages[0];
    this.generellService.setLanguage({lang:this.selectedLanguage.code}).subscribe((res:any)=>{
      this.languageService.setLanguage(this.selectedLanguage.code)
    })
  }
  @HostListener('document:click', ['$event'])

  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
  selectLanguage(language:LanguageSelect) {
    this.selectedLanguage = language;
    this.isOpen = false;
    this.generellService.setLanguage({lang:language.code}).subscribe((res:any)=>{
      this.languageService.setLanguage(language.code)
    })
  }
}
