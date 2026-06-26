import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/module/auth/auth.service';
import { UsersService } from '../../../src/module/users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('me', () => {
    it('should return user without password', async () => {
      const mockUser = { id: 1, email: 'test@test.com', password: 'hashed_password', role: 'user' };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.me(1);

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(1);
    });
  });
});