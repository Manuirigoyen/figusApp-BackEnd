import { Test, TestingModule } from '@nestjs/testing';

import { AlbumsController } from '../../../src/module/albums/albums.controller';
import { AlbumsService } from '../../../src/module/albums/albums.service';

describe('AlbumsController', () => {
  let controller: AlbumsController;

  const mockAlbumsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumsController],
      providers: [
        {
          provide: AlbumsService,
          useValue: mockAlbumsService,
        },
      ],
    }).compile();

    controller = module.get<AlbumsController>(AlbumsController);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all albums', async () => {
      const result = [{ id: 1 }];

      mockAlbumsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return one album', async () => {
      const result = { id: 1 };

      mockAlbumsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
    });
  });

  describe('create', () => {
    it('should create an album', async () => {
      const dto = {
        name: 'Album',
      };

      const result = {
        id: 1,
        ...dto,
      };

      mockAlbumsService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update an album', async () => {
      const result = {
        id: 1,
        name: 'Updated',
      };

      mockAlbumsService.update.mockResolvedValue(result);

      expect(
        await controller.update(1, {
          name: 'Updated',
        } as any),
      ).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove an album', async () => {
      mockAlbumsService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
    });
  });
});