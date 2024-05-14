import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateSelectionSingleComponent } from './date-selection-single.component';

describe('DateSelectionSingleComponent', () => {
  let component: DateSelectionSingleComponent;
  let fixture: ComponentFixture<DateSelectionSingleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DateSelectionSingleComponent]
    });
    fixture = TestBed.createComponent(DateSelectionSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
