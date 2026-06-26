import { JwtStrategy } from '../../../src/module/auth/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy({
      get: jest.fn().mockReturnValue('secret'),
    } as any);
  });

  it('should validate payload', async () => {
    const payload = {
      sub: 1,
      email: 'test@test.com',
      role: 'user',
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 1,
      email: 'test@test.com',
      role: 'user',
    });
  });
});