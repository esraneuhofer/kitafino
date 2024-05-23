import {Component, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
interface LanguageSelect{id:number,name:string,avatar:string,code:string}
@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
  styleUrls: ['./select-language.component.scss']
})
export class SelectLanguageComponent {
  currentLanguage: string = 'de'

  @Output() changeLanguage = new EventEmitter<string>(); //Triggers Reload getSplits => recalculate Total
  people: LanguageSelect[] = [
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
  selectedPerson:LanguageSelect = this.people[0];
  isOpen = false;

  constructor(private translate: TranslateService, private eRef: ElementRef) {
    // Set the initial language from sessionStorage or localStorage
    this.currentLanguage = sessionStorage.getItem('language') || localStorage.getItem('language') || 'de';
    this.translate.use(this.currentLanguage);

    // Set the selected person based on the current language
    this.selectedPerson = this.people.find(person => person.code === this.currentLanguage) || this.people[0];
  }
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
  selectPerson(person:LanguageSelect) {
    this.selectedPerson = person;
    this.isOpen = false;
    this.changeLanguage.emit(person.code);
  }
}
