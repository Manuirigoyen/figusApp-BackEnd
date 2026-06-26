import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { AlbumsService } from '../../../src/module/albums/albums.service';
import { Album } from '../../../src/module/albums/entities/album.entity';
import { Sticker } from '../../../src/module/stickers/entities/sticker.entity';
import { UserAlbumSticker } from '../../../src/module/albums/entities/user-album-sticker.entity';
import { Winner } from '../../../src/module/albums/entities/winner.entity';
import { UploadsService } from '../../../src/module/uploads/uploads.service';

describe('AlbumsService', () => {
  let service: AlbumsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUploadsService = {
    createAlbumDirectory: jest.fn(),
    removeAlbumDirectory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumsService,
        { provide: getRepositoryToken(Album), useValue: mockRepository },
        { provide: getRepositoryToken(Sticker), useValue: mockRepository },
        { provide: getRepositoryToken(UserAlbumSticker), useValue: mockRepository },
        { provide: getRepositoryToken(Winner), useValue: mockRepository },
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    service = module.get<AlbumsService>(AlbumsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an album and its directory', async () => {
      const dto = { name: 'World Cup', class: 'sports', nationality: 'int', capacity: 100 };
      const savedAlbum = { id: 1, ...dto };

      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue(savedAlbum);
      mockUploadsService.createAlbumDirectory.mockResolvedValue(undefined);

      const result = await service.create(dto as any);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockUploadsService.createAlbumDirectory).toHaveBeenCalledWith(1);
      expect(result).toEqual(savedAlbum);
    });

    it('should throw if saved album has no id', async () => {
      mockRepository.save.mockResolvedValue({});
      await expect(service.create({} as any)).rejects.toThrow('Saved album has no id');
    });
  });

  describe('findAll', () => {
    it('should return all albums', async () => {
      const albums = [{ id: 1 }];
      mockRepository.find.mockResolvedValue(albums);
      const result = await service.findAll();
      expect(result).toEqual(albums);
    });
  });

  describe('findOne', () => {
    it('should return one album', async () => {
      const album = { id: 1 };
      mockRepository.findOne.mockResolvedValue(album);
      const result = await service.findOne(1);
      expect(result).toEqual(album);
    });
  });

  describe('update', () => {
    it('should update and return album', async () => {
      const updatedAlbum = { id: 1, name: 'Updated' };
      mockRepository.update.mockResolvedValue(undefined);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedAlbum as any);

      const result = await service.update(1, { name: 'Updated' } as any);
      expect(result).toEqual(updatedAlbum);
    });
  });

  describe('remove', () => {
    it('should delete album and remove directory', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as any);
      mockRepository.delete.mockResolvedValue(undefined);
      mockUploadsService.removeAlbumDirectory.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(mockUploadsService.removeAlbumDirectory).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if album does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});