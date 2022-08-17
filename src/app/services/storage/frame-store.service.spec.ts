import { TestBed } from '@angular/core/testing';

import { FrameStoreService } from './frame-store.service';

describe('FrameStoreService', () => {
  let service: FrameStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrameStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
