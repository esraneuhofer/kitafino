import { Component, OnInit } from '@angular/core';
import { SchoolService } from '../../service/school.service';
import { EinrichtungInterface } from '../../classes/einrichtung.class';

@Component({
  selector: 'app-contact-caterer',
  templateUrl: './contact-caterer.component.html',
  styleUrls: ['./contact-caterer.component.scss']
})
export class ContactCatererComponent implements OnInit {

  einrichtung: EinrichtungInterface | null = null;
  pageLoaded = false;

  constructor(private schoolService: SchoolService) { }

  ngOnInit(): void {
    this.loadEinrichtungData();
  }

  loadEinrichtungData(): void {
    this.schoolService.getSchoolSettings().subscribe({
      next: (data: EinrichtungInterface) => {
        this.einrichtung = data;
        this.pageLoaded = true;
        console.log('Einrichtung data loaded:', data);
      },
      error: (error) => {
        console.error('Error loading einrichtung data:', error);
        this.pageLoaded = true;
      }
    });
  }

  // Hilfsmethode um die vollständige Adresse des Caterers zu formatieren
  get catererFullAddress(): string {
    if (!this.einrichtung) return '';

    const parts = [
      this.einrichtung.streetCaterer,
      `${this.einrichtung.zipcodeCaterer} ${this.einrichtung.cityCaterer}`
    ].filter(part => part && part.trim() !== '');

    return parts.join('\n');
  }

  // Hilfsmethode um zu prüfen ob Caterer-Daten vorhanden sind
  get hasCatererData(): boolean {
    return !!(this.einrichtung?.nameCateringCompany ||
      this.einrichtung?.emailCatering ||
      this.einrichtung?.streetCaterer);
  }
}
