import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacationParentComponent } from './vacation-parent.component';

describe('VacationParentComponent', () => {
  let component: VacationParentComponent;
  let fixture: ComponentFixture<VacationParentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VacationParentComponent]
    });
    fixture = TestBed.createComponent(VacationParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
