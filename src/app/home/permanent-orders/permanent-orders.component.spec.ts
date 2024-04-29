import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermanentOrdersComponent } from './permanent-orders.component';

describe('PermanentOrdersComponent', () => {
  let component: PermanentOrdersComponent;
  let fixture: ComponentFixture<PermanentOrdersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PermanentOrdersComponent]
    });
    fixture = TestBed.createComponent(PermanentOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
