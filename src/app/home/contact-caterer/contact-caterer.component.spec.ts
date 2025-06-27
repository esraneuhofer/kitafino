import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCatererComponent } from './contact-caterer.component';

describe('ContactCatererComponent', () => {
  let component: ContactCatererComponent;
  let fixture: ComponentFixture<ContactCatererComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactCatererComponent]
    });
    fixture = TestBed.createComponent(ContactCatererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
