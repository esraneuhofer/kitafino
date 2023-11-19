import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPaymentOverviewComponent } from './account-payment-overview.component';

describe('AccountPaymentOverviewComponent', () => {
  let component: AccountPaymentOverviewComponent;
  let fixture: ComponentFixture<AccountPaymentOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPaymentOverviewComponent]
    });
    fixture = TestBed.createComponent(AccountPaymentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
