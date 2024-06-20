import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstAccessOrderDialogComponent } from './first-access-order-dialog.component';

describe('FirstAccessOrderDialogComponent', () => {
  let component: FirstAccessOrderDialogComponent;
  let fixture: ComponentFixture<FirstAccessOrderDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirstAccessOrderDialogComponent]
    });
    fixture = TestBed.createComponent(FirstAccessOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
