import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorWeekendBannerComponent } from './error-weekend-banner.component';

describe('ErrorWeekendBannerComponent', () => {
  let component: ErrorWeekendBannerComponent;
  let fixture: ComponentFixture<ErrorWeekendBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorWeekendBannerComponent]
    });
    fixture = TestBed.createComponent(ErrorWeekendBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
