import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportErrorDialogComponent } from './report-error-dialog.component';

describe('ReportErrorDialogComponent', () => {
  let component: ReportErrorDialogComponent;
  let fixture: ComponentFixture<ReportErrorDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportErrorDialogComponent]
    });
    fixture = TestBed.createComponent(ReportErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
