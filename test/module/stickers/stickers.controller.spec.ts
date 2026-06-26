import { Test, TestingModule } from '@nestjs/testing';

import { StickersController } from '../../../src/module/stickers/stickers.controller';
import { StickersService } from '../../../src/module/stickers/stickers.service';

describe('StickersController', () => {
  let controller: StickersController;

  const mockStickersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StickersController],
      providers: [
        {
          provide: StickersService,
          useValue: mockStickersService,
        },
      ],
    }).compile();

    controller = module.get<StickersController>(StickersController);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all stickers', async () => {
      const result = [{ id: 1 }];

      mockStickersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return one sticker', async () => {
      const result = { id: 1 };

      mockStickersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
    });
  });

  describe('create', () => {
    it('should create a sticker', async () => {
      const dto = {
        pack_id: 1,
        number: 10,
        name: 'Messi',
      };

      const result = {
        id: 1,
        ...dto,
      };

      mockStickersService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a sticker', async () => {
      const result = {
        id: 1,
        name: 'Updated',
      };

      mockStickersService.update.mockResolvedValue(result);

      expect(
        await controller.update(1, {
          name: 'Updated',
        } as any),
      ).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a sticker', async () => {
      mockStickersService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
    });
  });
});