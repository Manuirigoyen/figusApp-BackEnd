import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '../../../src/module/auth/auth.controller';
import { AuthService } from '../../../src/module/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AuthController],

        providers: [
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
        ],
      }).compile();

    controller =
      module.get<AuthController>(
        AuthController,
      );

    jest.clearAllMocks();
  });

  it('should login user and set cookie', async () => {
    mockAuthService.login.mockResolvedValue({
      access_token: 'token',
    });

    const result =
      await controller.login(
        {
          email: 'test@test.com',
          password: '12345678',
          captcha_token: 'token',
        },
        mockResponse as any,
      );

    expect(
      mockAuthService.login,
    ).toHaveBeenCalled();

    expect(
      mockResponse.cookie,
    ).toHaveBeenCalledWith(
      'access_token',
      'token',
      expect.objectContaining({
        httpOnly: true,
      }),
    );

    expect(result).toEqual({
      access_token: 'token',
      message: 'Login exitoso.',
    });
  });
});