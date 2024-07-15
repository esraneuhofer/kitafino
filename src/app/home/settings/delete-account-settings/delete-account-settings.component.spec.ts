import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAccountSettingsComponent } from './delete-account-settings.component';

describe('DeleteAccountSettingsComponent', () => {
  let component: DeleteAccountSettingsComponent;
  let fixture: ComponentFixture<DeleteAccountSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteAccountSettingsComponent]
    });
    fixture = TestBed.createComponent(DeleteAccountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
