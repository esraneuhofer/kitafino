import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralBannerComponent } from './general-banner.component';

describe('GeneralBannerComponent', () => {
  let component: GeneralBannerComponent;
  let fixture: ComponentFixture<GeneralBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralBannerComponent]
    });
    fixture = TestBed.createComponent(GeneralBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
