import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsOrderDialogComponent } from './details-order-dialog.component';

describe('DetailsOrderDialogComponent', () => {
  let component: DetailsOrderDialogComponent;
  let fixture: ComponentFixture<DetailsOrderDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsOrderDialogComponent]
    });
    fixture = TestBed.createComponent(DetailsOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
