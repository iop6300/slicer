import { TestBed } from '@angular/core/testing';

import { Gcode } from './gcode';

describe('Gcode', () => {
  let service: Gcode;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gcode);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
