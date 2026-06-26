import { Reflector } from '@nestjs/core';

import { RolesGuard } from '../../../../src/module/auth/guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});