import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogPermanetOrderComponent } from './confirm-dialog-permanet-order.component';

describe('ConfirmDialogPermanetOrderComponent', () => {
  let component: ConfirmDialogPermanetOrderComponent;
  let fixture: ComponentFixture<ConfirmDialogPermanetOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDialogPermanetOrderComponent]
    });
    fixture = TestBed.createComponent(ConfirmDialogPermanetOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
