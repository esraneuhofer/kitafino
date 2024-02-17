// clipboard.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  constructor() {}

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log('Text copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  }
}
