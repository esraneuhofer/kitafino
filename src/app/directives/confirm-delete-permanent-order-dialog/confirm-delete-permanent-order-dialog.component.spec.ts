import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeletePermanentOrderDialogComponent } from './confirm-delete-permanent-order-dialog.component';

describe('ConfirmDeletePermanentOrderDialogComponent', () => {
  let component: ConfirmDeletePermanentOrderDialogComponent;
  let fixture: ComponentFixture<ConfirmDeletePermanentOrderDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDeletePermanentOrderDialogComponent]
    });
    fixture = TestBed.createComponent(ConfirmDeletePermanentOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
