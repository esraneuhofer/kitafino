import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccuntDetailsComponent } from './accunt-details.component';

describe('AccuntDetailsComponent', () => {
  let component: AccuntDetailsComponent;
  let fixture: ComponentFixture<AccuntDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccuntDetailsComponent]
    });
    fixture = TestBed.createComponent(AccuntDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
