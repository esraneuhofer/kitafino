import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStudentComponent } from './order-student.component';

describe('OrderStudentComponent', () => {
  let component: OrderStudentComponent;
  let fixture: ComponentFixture<OrderStudentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderStudentComponent]
    });
    fixture = TestBed.createComponent(OrderStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
