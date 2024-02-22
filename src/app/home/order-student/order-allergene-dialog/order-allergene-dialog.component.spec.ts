import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAllergeneDialogComponent } from './order-allergene-dialog.component';

describe('OrderAllergeneDialogComponent', () => {
  let component: OrderAllergeneDialogComponent;
  let fixture: ComponentFixture<OrderAllergeneDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderAllergeneDialogComponent]
    });
    fixture = TestBed.createComponent(OrderAllergeneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
