import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerNoStudentOrderComponent } from './banner-no-student-order.component';

describe('BannerNoStudentOrderComponent', () => {
  let component: BannerNoStudentOrderComponent;
  let fixture: ComponentFixture<BannerNoStudentOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BannerNoStudentOrderComponent]
    });
    fixture = TestBed.createComponent(BannerNoStudentOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
