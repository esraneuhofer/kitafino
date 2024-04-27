import { TestBed } from '@angular/core/testing';

import { IntstallPromptService } from './intstall-prompt.service';

describe('IntstallPromptService', () => {
  let service: IntstallPromptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntstallPromptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
