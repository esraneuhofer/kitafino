import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelTooltipComponent } from './label-tooltip.component';

describe('LabelTooltipComponent', () => {
  let component: LabelTooltipComponent;
  let fixture: ComponentFixture<LabelTooltipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LabelTooltipComponent]
    });
    fixture = TestBed.createComponent(LabelTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
