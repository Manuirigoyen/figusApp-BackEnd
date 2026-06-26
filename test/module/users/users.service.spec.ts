import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../../../src/module/users/users.service';

import { User } from '../../../src/module/users/entities/user.entity';

import { UploadsService } from '../../../src/module/uploads/uploads.service';

import { TurnstileService } from '../../../src/module/turnstile/turnstile.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockUploadsService = {
    createUserDirectory: jest.fn(),
    removeUserDirectory: jest.fn(),
  };

  const mockTurnstileService = {
    validate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          UsersService,

          {
            provide: getRepositoryToken(User),
            useValue: mockUserRepository,
          },

          {
            provide: UploadsService,
            useValue: mockUploadsService,
          },

          {
            provide: TurnstileService,
            useValue: mockTurnstileService,
          },
        ],
      }).compile();

    service =
      module.get<UsersService>(
        UsersService,
      );

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      mockTurnstileService.validate.mockResolvedValue(
        true,
      );

      mockUserRepository.findOne.mockResolvedValue(
        null,
      );

      mockUserRepository.create.mockReturnValue({
        id: 1,
        email: 'test@test.com',
      });

      mockUserRepository.save.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      const dto = {
        first_name: 'Lionel',
        last_name: 'Messi',
        date_of_birth: '1987-06-24',
        nationality: 'AR',
        email: 'test@test.com',
        phone_number: '+54',
        password: '12345678',

        captcha_token:
          'mock-captcha-token',
      };

      const result =
        await service.create(dto);

      expect(result.email).toBe(
        'test@test.com',
      );

      expect(
        mockTurnstileService.validate,
      ).toHaveBeenCalledWith(
        'mock-captcha-token',
      );

      expect(
        mockUploadsService.createUserDirectory,
      ).toHaveBeenCalledWith(1);
    });

    it('should throw if email already exists', async () => {
      mockTurnstileService.validate.mockResolvedValue(
        true,
      );

      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
      });

      const dto = {
        first_name: 'Lionel',
        last_name: 'Messi',
        date_of_birth: '1987-06-24',
        nationality: 'AR',
        email: 'test@test.com',
        password: '12345678',

        captcha_token:
          'mock-captcha-token',
      };

      await expect(
        service.create(dto),
      ).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
      });

      const result =
        await service.findOne(1);

      expect(result.id).toBe(1);
    });

    it('should throw if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne(1),
      ).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
      });

      mockUserRepository.delete.mockResolvedValue(
        {},
      );

      await service.remove(1);

      expect(
        mockUserRepository.delete,
      ).toHaveBeenCalledWith(1);
    });
  });
});