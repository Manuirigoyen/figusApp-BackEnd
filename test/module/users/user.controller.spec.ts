import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from '../../../src/module/users/user.controller';
import { UsersService } from '../../../src/module/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],

      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return users', async () => {
      mockUsersService.findAll.mockResolvedValue([
        { id: 1 },
      ]);

      const result = await controller.findAll();

      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return one user', async () => {
      mockUsersService.findOne.mockResolvedValue({
        id: 1,
      });

      const result = await controller.findOne(1);

      expect(result.id).toBe(1);
    });
  });
});