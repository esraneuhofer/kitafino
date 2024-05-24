import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolAnnouncmentsComponent } from './school-announcments.component';

describe('SchoolAnnouncmentsComponent', () => {
  let component: SchoolAnnouncmentsComponent;
  let fixture: ComponentFixture<SchoolAnnouncmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchoolAnnouncmentsComponent]
    });
    fixture = TestBed.createComponent(SchoolAnnouncmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
