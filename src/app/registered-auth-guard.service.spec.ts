import { TestBed } from '@angular/core/testing';

import { RegisteredAuthGuardService } from './registered-auth-guard.service';

describe('RegisteredAuthGuardService', () => {
  let service: RegisteredAuthGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisteredAuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
