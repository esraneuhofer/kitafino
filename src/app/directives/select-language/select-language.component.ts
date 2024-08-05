import {Component, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {GenerellService} from "../../service/generell.service";
import {LanguageService} from "../../service/language.service";
const languagesConst: LanguageSelect[] = [
  { id: 1, name: 'Deutsch', avatar: '/assets/flags/de.png', code: 'de' },  // Germany flag
  { id: 3, name: 'English', avatar: '/assets/flags/gb.png', code: 'en' },  // UK flag
  { id: 2, name: 'Türkçe', avatar: '/assets/flags/tr.png', code: 'tr' },  // Turkey flag
  { id: 4, name: 'العربية (Arabic)', avatar: '/assets/flags/sa.png', code: 'ar' },  // Saudi Arabia flag (representing Arabic countries)
  { id: 12, name: 'Українська (Ukrainian)', avatar: '/assets/flags/ua.png', code: 'uk' },  // Ukraine flag
  { id: 9, name: 'Español', avatar: '/assets/flags/es.png', code: 'es' },  // Spain flag
  { id: 18, name: 'فارسی (Farsi)', avatar: '/assets/flags/ir.png', code: 'fa' },  // Iran flag (representing Farsi)
  { id: 5, name: 'Polski', avatar: '/assets/flags/pl.png', code: 'pl' },  // Poland flag
  { id: 14, name: '中文 (Chinese)', avatar: '/assets/flags/cn.png', code: 'zh' },  // China flag
  { id: 13, name: 'Français (French)', avatar: '/assets/flags/fr.png', code: 'fr' },  // France flag
  { id: 7, name: 'Italiano', avatar: '/assets/flags/it.png', code: 'it' },  // Italy flag
  { id: 6, name: 'Русский (Russian)', avatar: '/assets/flags/ru.png', code: 'ru' },  // Russia flag
  { id: 8, name: 'Ελληνικά (Greek)', avatar: '/assets/flags/gr.png', code: 'el' },  // Greece flag
  { id: 10, name: 'ไทย (Thailand)', avatar: '/assets/flags/th.png', code: 'th' },  // Thailand flag
  { id: 11, name: 'Nederlands', avatar: '/assets/flags/nl.png', code: 'nl' },  // Netherlands flag
  { id: 15, name: 'हिंदी (Hindi)', avatar: '/assets/flags/in.png', code: 'hi' },  // India flag
  { id: 16, name: '廣東話 (Cantonese)', avatar: '/assets/flags/hk.png', code: 'yue' },  // Hong Kong flag (Cantonese)
  { id: 17, name: 'Български (Bulgarian)', avatar: '/assets/flags/bg.png', code: 'bg' }  // Bulgaria flag
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
