import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButComponent } from './but.component';

describe('ButComponent', () => {
  let component: ButComponent;
  let fixture: ComponentFixture<ButComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ButComponent]
    });
    fixture = TestBed.createComponent(ButComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
