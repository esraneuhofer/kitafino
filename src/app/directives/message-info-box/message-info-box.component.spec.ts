import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageInfoBoxComponent } from './message-info-box.component';

describe('MessageInfoBoxComponent', () => {
  let component: MessageInfoBoxComponent;
  let fixture: ComponentFixture<MessageInfoBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessageInfoBoxComponent]
    });
    fixture = TestBed.createComponent(MessageInfoBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
