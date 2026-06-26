import { Test, TestingModule } from '@nestjs/testing';

import { PacksController } from '../../../src/module/packs/packs.controller';
import { PacksService } from '../../../src/module/packs/packs.service';

describe('PacksController', () => {
  let controller: PacksController;

  const mockPacksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacksController],
      providers: [
        {
          provide: PacksService,
          useValue: mockPacksService,
        },
      ],
    }).compile();

    controller = module.get<PacksController>(PacksController);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all packs', async () => {
      const result = [{ id: 1 }];

      mockPacksService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return one pack', async () => {
      const result = { id: 1 };

      mockPacksService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
    });
  });

  describe('create', () => {
    it('should create a pack', async () => {
      const dto = {
        album_id: 1,
        class: 'Especial',
        price: 2500,
        stock: 100,
        capacity: 5,
      };

      const result = {
        id: 1,
        ...dto,
      };

      mockPacksService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a pack', async () => {
      const result = {
        id: 1,
        class: 'Updated',
      };

      mockPacksService.update.mockResolvedValue(result);

      expect(
        await controller.update(1, {
          class: 'Updated',
        } as any),
      ).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a pack', async () => {
      mockPacksService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
    });
  });
});