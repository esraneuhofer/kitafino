import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appIbanFormat]'
})
export class IbanFormatDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const input = event.target;
    let trimmed = input.value.replace(/\s+/g, '');
    if (trimmed.length > 0) {
      trimmed = trimmed.match(new RegExp('.{1,4}', 'g')).join(' ');
    }
    input.value = trimmed;
  }

}
