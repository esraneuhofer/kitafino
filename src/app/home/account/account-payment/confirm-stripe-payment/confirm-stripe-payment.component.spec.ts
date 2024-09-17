import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmStripePaymentComponent } from './confirm-stripe-payment.component';

describe('ConfirmStripePaymentComponent', () => {
  let component: ConfirmStripePaymentComponent;
  let fixture: ComponentFixture<ConfirmStripePaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmStripePaymentComponent]
    });
    fixture = TestBed.createComponent(ConfirmStripePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
