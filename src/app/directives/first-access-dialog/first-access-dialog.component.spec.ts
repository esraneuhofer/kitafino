import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstAccessDialogComponent } from './first-access-dialog.component';

describe('FirstAccessDialogComponent', () => {
  let component: FirstAccessDialogComponent;
  let fixture: ComponentFixture<FirstAccessDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirstAccessDialogComponent]
    });
    fixture = TestBed.createComponent(FirstAccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
