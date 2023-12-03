import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationInputComponent } from './registration-input.component';

describe('RegistrationInputComponent', () => {
  let component: RegistrationInputComponent;
  let fixture: ComponentFixture<RegistrationInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrationInputComponent]
    });
    fixture = TestBed.createComponent(RegistrationInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
