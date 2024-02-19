import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmWithdrawDialogComponent } from './confirm-withdraw-dialog.component';

describe('ConfirmWithdrawDialogComponent', () => {
  let component: ConfirmWithdrawDialogComponent;
  let fixture: ComponentFixture<ConfirmWithdrawDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmWithdrawDialogComponent]
    });
    fixture = TestBed.createComponent(ConfirmWithdrawDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
