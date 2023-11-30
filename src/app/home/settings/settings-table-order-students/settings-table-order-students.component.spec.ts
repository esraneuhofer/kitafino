import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsTableOrderStudentsComponent } from './settings-table-order-students.component';

describe('SettingsTableOrderStudentsComponent', () => {
  let component: SettingsTableOrderStudentsComponent;
  let fixture: ComponentFixture<SettingsTableOrderStudentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsTableOrderStudentsComponent]
    });
    fixture = TestBed.createComponent(SettingsTableOrderStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
