import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordSettingsComponent } from './change-password-settings.component';

describe('ChangePasswordSettingsComponent', () => {
  let component: ChangePasswordSettingsComponent;
  let fixture: ComponentFixture<ChangePasswordSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangePasswordSettingsComponent]
    });
    fixture = TestBed.createComponent(ChangePasswordSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
