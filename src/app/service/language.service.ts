import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject: BehaviorSubject<string>;
  public currentLanguage$: Observable<string>;

  constructor(private translate: TranslateService) {
    const initialLanguage = sessionStorage.getItem('language') || localStorage.getItem('language') || 'de';
    this.currentLanguageSubject = new BehaviorSubject<string>(initialLanguage);
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();
    this.translate.use(initialLanguage);
  }

  setLanguage(language: string): void {
    console.log('setLanguage', language);
    this.currentLanguageSubject.next(language);
    this.translate.use(language);
    sessionStorage.setItem('language', language);
    localStorage.setItem('language', language);
  }

  getLanguage(): string {
    return this.currentLanguageSubject.value;
  }
}
