import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekplanPdfComponent } from './weekplan-pdf.component';

describe('WeekplanPdfComponent', () => {
  let component: WeekplanPdfComponent;
  let fixture: ComponentFixture<WeekplanPdfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeekplanPdfComponent]
    });
    fixture = TestBed.createComponent(WeekplanPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
