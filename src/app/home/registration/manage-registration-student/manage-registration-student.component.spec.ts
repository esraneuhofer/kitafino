import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRegistrationStudentComponent } from './manage-registration-student.component';

describe('ManageRegistrationStudentComponent', () => {
  let component: ManageRegistrationStudentComponent;
  let fixture: ComponentFixture<ManageRegistrationStudentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRegistrationStudentComponent]
    });
    fixture = TestBed.createComponent(ManageRegistrationStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
