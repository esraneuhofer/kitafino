import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomToastrComponent } from './custom-toastr.component';

describe('CustomToastrComponent', () => {
  let component: CustomToastrComponent;
  let fixture: ComponentFixture<CustomToastrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomToastrComponent]
    });
    fixture = TestBed.createComponent(CustomToastrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
