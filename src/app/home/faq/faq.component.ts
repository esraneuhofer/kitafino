import { Component } from '@angular/core';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  faqs: FAQ[] = [
    {
      id: 0,
      question: "What's the best thing about Switzerland?",
      answer: "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
      open: false
    },
    // Weitere Fragen...
  ];

  toggleFAQ(faq: FAQ) {
    faq.open = !faq.open;
  }
}
