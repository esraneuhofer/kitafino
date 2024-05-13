import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotSuccessStripeComponent } from './not-success-stripe.component';

describe('NotSuccessStripeComponent', () => {
  let component: NotSuccessStripeComponent;
  let fixture: ComponentFixture<NotSuccessStripeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotSuccessStripeComponent]
    });
    fixture = TestBed.createComponent(NotSuccessStripeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
