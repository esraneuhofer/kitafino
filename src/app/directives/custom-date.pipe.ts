

import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../service/language.service';

@Pipe({
  name: 'customDate',
  pure: false
})
export class CustomDatePipe implements PipeTransform {
  private currentLanguage: string = 'de'

  constructor(private languageService: LanguageService) {
    this.languageService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });
  }

  transform(value: any, format: string): any {
    const datePipe = new DatePipe(this.currentLanguage);
    return datePipe.transform(value, format, '', this.currentLanguage);
  }
}
