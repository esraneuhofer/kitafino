import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTenantComponent } from './register-tenant.component';

describe('RegisterTenantComponent', () => {
  let component: RegisterTenantComponent;
  let fixture: ComponentFixture<RegisterTenantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterTenantComponent]
    });
    fixture = TestBed.createComponent(RegisterTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
