import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KindergardenSettingComponent } from './kindergarden-setting.component';

describe('KindergardenSettingComponent', () => {
  let component: KindergardenSettingComponent;
  let fixture: ComponentFixture<KindergardenSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KindergardenSettingComponent]
    });
    fixture = TestBed.createComponent(KindergardenSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
