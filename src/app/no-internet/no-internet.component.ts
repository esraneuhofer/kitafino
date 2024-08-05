// no-internet.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-no-internet',
  template: `
    <div class="no-internet">
      <h1>Keine Internetverbindung</h1>
      <p>Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.</p>
    </div>
  `,
  styles: [`
    .no-internet {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
  `]
})
export class NoInternetComponent { }
