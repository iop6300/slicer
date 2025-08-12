import { TestBed } from '@angular/core/testing';

import { Slicer } from './slicer';

describe('Slicer', () => {
  let service: Slicer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Slicer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
