import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteSpecialFoodComponent } from './confirm-delete-special-food.component';

describe('ConfirmDeleteSpecialFoodComponent', () => {
  let component: ConfirmDeleteSpecialFoodComponent;
  let fixture: ComponentFixture<ConfirmDeleteSpecialFoodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDeleteSpecialFoodComponent]
    });
    fixture = TestBed.createComponent(ConfirmDeleteSpecialFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
