import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerNoRegistrationOrderComponent } from './banner-no-registration-order.component';

describe('BannerNoRegistrationOrderComponent', () => {
  let component: BannerNoRegistrationOrderComponent;
  let fixture: ComponentFixture<BannerNoRegistrationOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BannerNoRegistrationOrderComponent]
    });
    fixture = TestBed.createComponent(BannerNoRegistrationOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
