import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { PacksService } from '../../../src/module/packs/packs.service';
import { Pack } from '../../../src/module/packs/entities/pack.entity';
import { UploadsService } from '../../../src/module/uploads/uploads.service';

describe('PacksService', () => {
  let service: PacksService;

  const mockPacksRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUploadsService = {
    createPackDirectory: jest.fn(),
    removePackDirectory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacksService,
        {
          provide: getRepositoryToken(Pack),
          useValue: mockPacksRepository,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    service = module.get<PacksService>(PacksService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a pack and its directory', async () => {
      const dto = {
        album_id: 1,
        class: 'Especial',
        price: 2500,
        stock: 100,
        capacity: 5,
      };

      const savedPack = {
        id: 1,
        ...dto,
      };

      mockPacksRepository.create.mockReturnValue(dto);

      mockPacksRepository.save.mockResolvedValue(savedPack);

      mockUploadsService.createPackDirectory.mockResolvedValue(undefined);

      const result = await service.create(dto as any);

      expect(mockPacksRepository.create).toHaveBeenCalledWith(dto);

      expect(mockPacksRepository.save).toHaveBeenCalled();

      expect(
        mockUploadsService.createPackDirectory,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(savedPack);
    });

    it('should throw if saved pack has no id', async () => {
      mockPacksRepository.create.mockReturnValue({});

      mockPacksRepository.save.mockResolvedValue({});

      await expect(service.create({} as any)).rejects.toThrow(
        'Saved pack has no id',
      );
    });

    it('should use default capacity when not provided', async () => {
      const dto = {
        album_id: 1,
        class: 'Especial',
        price: 2500,
        stock: 100,
      };

      mockPacksRepository.create.mockReturnValue({
        ...dto,
        capacity: 5,
      });

      mockPacksRepository.save.mockResolvedValue({
        id: 1,
        ...dto,
        capacity: 5,
      });

      await service.create(dto as any);

      expect(mockPacksRepository.create).toHaveBeenCalledWith({
        ...dto,
        capacity: 5,
      });
    });
  });

  describe('findAll', () => {
    it('should return all packs', async () => {
      const packs = [{ id: 1 }, { id: 2 }];

      mockPacksRepository.find.mockResolvedValue(packs);

      const result = await service.findAll();

      expect(mockPacksRepository.find).toHaveBeenCalledWith({
        relations: { album: true },
      });

      expect(result).toEqual(packs);
    });
  });

  describe('findOne', () => {
    it('should return one pack', async () => {
      const pack = { id: 1 };

      mockPacksRepository.findOne.mockResolvedValue(pack);

      const result = await service.findOne(1);

      expect(mockPacksRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { album: true },
      });

      expect(result).toEqual(pack);
    });
  });

  describe('update', () => {
    it('should update and return pack', async () => {
      const updatedPack = {
        id: 1,
        class: 'Updated',
      };

      mockPacksRepository.update.mockResolvedValue(undefined);

      jest.spyOn(service, 'findOne').mockResolvedValue(updatedPack as any);

      const result = await service.update(1, {
        class: 'Updated',
      } as any);

      expect(mockPacksRepository.update).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );

      expect(result).toEqual(updatedPack);
    });
  });

  describe('remove', () => {
    it('should delete pack and remove directory', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as any);

      mockPacksRepository.delete.mockResolvedValue(undefined);

      mockUploadsService.removePackDirectory.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockPacksRepository.delete).toHaveBeenCalledWith(1);

      expect(
        mockUploadsService.removePackDirectory,
      ).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if pack does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});