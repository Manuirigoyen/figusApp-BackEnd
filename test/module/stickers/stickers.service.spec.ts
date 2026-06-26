import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { StickersService } from '../../../src/module/stickers/stickers.service';
import { Sticker } from '../../../src/module/stickers/entities/sticker.entity';
import { UploadsService } from '../../../src/module/uploads/uploads.service';

describe('StickersService', () => {
  let service: StickersService;

  const mockStickersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUploadsService = {
    createStickerDirectory: jest.fn(),
    removeStickerDirectory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StickersService,
        {
          provide: getRepositoryToken(Sticker),
          useValue: mockStickersRepository,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    service = module.get<StickersService>(StickersService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a sticker and its directory', async () => {
      const dto = {
        album_id: 1,
        class: 'player',
        name: 'Lionel Messi',
        nationality: 'argentina',
      };

      const savedSticker = {
        id: 1,
        ...dto,
      };

      mockStickersRepository.create.mockReturnValue(dto);

      mockStickersRepository.save.mockResolvedValue(savedSticker);

      mockUploadsService.createStickerDirectory.mockResolvedValue(undefined);

      const result = await service.create(dto as any);

      expect(mockStickersRepository.create).toHaveBeenCalledWith(dto);

      expect(mockStickersRepository.save).toHaveBeenCalled();

      expect(
        mockUploadsService.createStickerDirectory,
      ).toHaveBeenCalledWith(1, 1);

      expect(result).toEqual(savedSticker);
    });

    it('should throw if saved sticker has no id', async () => {
      mockStickersRepository.create.mockReturnValue({});

      mockStickersRepository.save.mockResolvedValue({
        album_id: 1,
      });

      await expect(service.create({} as any)).rejects.toThrow(
        'Saved sticker has no id',
      );
    });

    it('should throw if saved sticker has no album_id', async () => {
      mockStickersRepository.create.mockReturnValue({});

      mockStickersRepository.save.mockResolvedValue({
        id: 1,
      });

      await expect(service.create({} as any)).rejects.toThrow(
        'Saved sticker has no album_id',
      );
    });
  });

  describe('findAll', () => {
    it('should return all stickers', async () => {
      const stickers = [{ id: 1 }, { id: 2 }];

      mockStickersRepository.find.mockResolvedValue(stickers);

      const result = await service.findAll();

      expect(mockStickersRepository.find).toHaveBeenCalledWith({
        relations: { album: true },
      });

      expect(result).toEqual(stickers);
    });
  });

  describe('findOne', () => {
    it('should return one sticker', async () => {
      const sticker = { id: 1 };

      mockStickersRepository.findOne.mockResolvedValue(sticker);

      const result = await service.findOne(1);

      expect(mockStickersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { album: true },
      });

      expect(result).toEqual(sticker);
    });
  });

  describe('update', () => {
    it('should update and return sticker', async () => {
      const updatedSticker = {
        id: 1,
        name: 'Kylian Mbappé',
      };

      mockStickersRepository.update.mockResolvedValue(undefined);

      jest.spyOn(service, 'findOne').mockResolvedValue(updatedSticker as any);

      const result = await service.update(1, {
        name: 'Kylian Mbappé',
      } as any);

      expect(mockStickersRepository.update).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );

      expect(result).toEqual(updatedSticker);
    });
  });

  describe('remove', () => {
    it('should delete sticker and remove directory', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 1,
        album_id: 5,
      } as any);

      mockStickersRepository.delete.mockResolvedValue(undefined);

      mockUploadsService.removeStickerDirectory.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockStickersRepository.delete).toHaveBeenCalledWith(1);

      expect(
        mockUploadsService.removeStickerDirectory,
      ).toHaveBeenCalledWith(5, 1);
    });

    it('should throw NotFoundException if sticker does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});