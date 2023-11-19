import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealInputCardComponent } from './meal-input-card.component';

describe('MealInputCardComponent', () => {
  let component: MealInputCardComponent;
  let fixture: ComponentFixture<MealInputCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MealInputCardComponent]
    });
    fixture = TestBed.createComponent(MealInputCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
