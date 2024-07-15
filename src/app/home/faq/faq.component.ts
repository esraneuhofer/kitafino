import { Component } from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({
        opacity: 0,
        height: '0px',
        overflow: 'hidden'
      })),
      state('*', style({
        opacity: 1,
        height: '*'
      })),
      transition('void <=> *', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class FaqComponent {
  faqs: FAQ[] = [
    {
      id: 0,
      question: "Ich habe keine Bestätigungsmail nach meiner Anmeldung erhalten. Was kann ich tun?",
      answer: `Sollten Sie keine E-Mail der Ihrer Registrierung erhalten haben, überprüfen Sie Ihren Spam-Ordner. Eine weitere Möglichkeit ist, dass Sie sich bei der Eingabe Ihrer E-Mail-Adresse vertippt haben. In diesem Fall können Sie sich erneut registrieren.
      Sollte Sie die Meldung [E-Mail bereits registriert] erhalten, können Sie Ihr Passwort zurücksetzten. Klicken Sie hierfür auf <b>[Passwort vergessen]</b> und geben Sie Ihre E-Mail-Adresse ein. Sie erhalten anschließend eine E-Mail mit einem neuen Passwort.
Sofern Sie auch nach diesen Schritten keine E-Mail erhalten, wenden Sie sich bitte an unseren Support unter <a  href='mailto:support@cateringexpert.de'><u style="color:#0a53be">support@cateringexpert.de</u></a>`,
      open: false
    },
    {
      id: 1,
      question: "Wie kann ich eine Bestellung ändern oder stornieren?",
      answer: `Um eine Bestellung zu ändern müssen Sie diese zuerst stornieren und dann eine neue Bestellung aufgeben. Gehen Sie hierfür auf auf die Seitennavigation und wählen Sie <b>[Bestellung]</b> aus.` +
        `Wählen Sie anschließend die Bestellung aus, die Sie stornieren möchten und klicken Sie auf das <b>[Mülltonnen-Symbol]</b> oder alternative auf das Kästchen mit dem Häckchen. Bestätigen Sie die anschließend die Stornierung.`,
      open: false
    },
    {
      id: 1,
      question: "Ich habe die Bestell - oder Abbestellfrist verpasst. Was kann ich machen?",
      answer: `Wir sind nur der Vermittler zwischen Ihnen und dem Caterer. Daher können wir keine Bestellungen stornieren oder ändern. Sollten Sie die Bestellfrist verpasst haben, wenden Sie sich bitte direkt an Ihren Caterer.
       Bitte haben Sie Verständnis, dass wir keine Stornierungen oder Änderungen an Bestellungen vornehmen können.`,
      open: false
    },

    // Weitere Fragen...
  ];

  toggleFAQ(faq: FAQ) {
    faq.open = !faq.open;
  }
}
