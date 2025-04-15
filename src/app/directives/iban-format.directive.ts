import { Directive, ElementRef, HostListener, AfterViewInit, Optional } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appIbanFormat]'
})
export class IbanFormatDirective implements AfterViewInit {

  constructor(private el: ElementRef, @Optional() private ngModel: NgModel) { }

  ngAfterViewInit() {
    // Format on initialization
    setTimeout(() => {
      const input = this.el.nativeElement;
      const formatted = this.formatEntireIban(input.value);
      
      if (this.ngModel && formatted !== input.value) {
        this.ngModel.viewToModelUpdate(formatted);
      }
      
      input.value = formatted;
    });
  }
  
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    // Skip for special keys
    if (event.key === 'Backspace' || event.key === 'Delete' || 
        event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
        event.key === 'Tab' || event.ctrlKey || event.metaKey) {
      return;
    }
    
    const input = this.el.nativeElement as HTMLInputElement;
    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    
    // Pre-calculate where the cursor would end up
    // Check if we need to add a space after the typed character
    if ((selectionStart === 2 && input.value.substr(0, 2).toUpperCase() === 'DE') || 
        (selectionStart > 2 && (selectionStart - 2) % 5 === 0)) {
      // Will need to insert a space - move cursor forward one extra position
      setTimeout(() => {
        input.setSelectionRange(selectionStart + 2, selectionStart + 2);
      });
    }
  }
  
  @HostListener('input', ['$event']) onInput(event: any) {
    const input = event.target;
    const cursorPos = input.selectionStart || 0;
    const value = input.value;
    
    // Remove any duplicate spaces
    const cleanedValue = value.replace(/\s+/g, ' ');
    
    // Insert spaces in correct positions
    let formattedValue = '';
    let nonSpacePos = 0;
    let actualPos = 0;
    
    for (let i = 0; i < cleanedValue.length; i++) {
      const char = cleanedValue[i];
      
      // Add the character
      formattedValue += char;
      actualPos++;
      
      // Only count non-space characters
      if (char !== ' ') {
        nonSpacePos++;
        
        // For DE format
        if (cleanedValue.toUpperCase().startsWith('DE')) {
          // After the country code
          if (nonSpacePos === 2) {
            formattedValue += ' ';
            actualPos++;
          } 
          // Then every 4 characters
          else if (nonSpacePos > 2 && (nonSpacePos - 2) % 4 === 0 && i < cleanedValue.length - 1) {
            formattedValue += ' ';
            actualPos++;
          }
        } 
        // Standard format (every 4 characters)
        else if (nonSpacePos % 4 === 0 && i < cleanedValue.length - 1) {
          formattedValue += ' ';
          actualPos++;
        }
      }
    }
    
    // Only update if there's a difference
    if (formattedValue !== value) {
      // Calculate new cursor position based on added spaces
      let spacesBeforeOldCursor = (value.substring(0, cursorPos).match(/\s/g) || []).length;
      let spacesBeforeNewCursor = (formattedValue.substring(0, cursorPos).match(/\s/g) || []).length;
      let spaceDiff = spacesBeforeNewCursor - spacesBeforeOldCursor;
      
      const newCursorPos = cursorPos + spaceDiff;
      
      // Update value
      input.value = formattedValue;
      
      // Update model
      if (this.ngModel) {
        this.ngModel.viewToModelUpdate(formattedValue);
      }
      
      // Set cursor
      input.setSelectionRange(newCursorPos, newCursorPos);
    }
  }
  
  // Format the entire IBAN at once (for initial value)
  private formatEntireIban(value: string): string {
    if (!value) return '';
    
    // Remove all spaces
    const cleanValue = value.replace(/\s+/g, '');
    
    if (cleanValue.length === 0) return '';
    
    // Format based on starting characters
    if (cleanValue.toUpperCase().startsWith('DE')) {
      const countryCode = cleanValue.substring(0, 2);
      const rest = cleanValue.substring(2);
      
      let formatted = countryCode + ' ';
      
      for (let i = 0; i < rest.length; i += 4) {
        formatted += rest.substring(i, Math.min(i + 4, rest.length));
        if (i + 4 < rest.length) {
          formatted += ' ';
        }
      }
      
      return formatted;
    } else {
      // Standard format
      let formatted = '';
      for (let i = 0; i < cleanValue.length; i += 4) {
        formatted += cleanValue.substring(i, Math.min(i + 4, cleanValue.length));
        if (i + 4 < cleanValue.length) {
          formatted += ' ';
        }
      }
      return formatted;
    }
  }
}