import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerNoSubgroupOrderComponent } from './banner-no-subgroup-order.component';

describe('BannerNoSubgroupOrderComponent', () => {
  let component: BannerNoSubgroupOrderComponent;
  let fixture: ComponentFixture<BannerNoSubgroupOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BannerNoSubgroupOrderComponent]
    });
    fixture = TestBed.createComponent(BannerNoSubgroupOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
