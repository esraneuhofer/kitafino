import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedComponent } from './seed.component';

describe('SeedComponent', () => {
  let component: SeedComponent;
  let fixture: ComponentFixture<SeedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeedComponent]
    });
    fixture = TestBed.createComponent(SeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
