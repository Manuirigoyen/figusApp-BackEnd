import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { PrizeService } from '../../../src/module/prize/prize.service';
import { Prize } from '../../../src/module/prize/entities/prize.entity';

describe('PrizeService', () => {
  let service: PrizeService;

  const expectedRelations = ['sticker', 'packBronce', 'packPlateado', 'packDorado'];

  const mockPrizeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrizeService,
        {
          provide: getRepositoryToken(Prize),
          useValue: mockPrizeRepository,
        },
      ],
    }).compile();

    service = module.get<PrizeService>(PrizeService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a prize', async () => {
      const dto = {
        id_sticker: 9,
        id_packs_bronce: 1,
        id_packs_plateado: 4,
        id_packs_dorado: 7,
        spins: 5,
      };

      const savedPrize = {
        id: 1,
        ...dto,
      };

      mockPrizeRepository.create.mockReturnValue(savedPrize);
      mockPrizeRepository.save.mockResolvedValue(savedPrize);

      const result = await service.create(dto as any);

      expect(mockPrizeRepository.create).toHaveBeenCalledWith(dto);
      expect(mockPrizeRepository.save).toHaveBeenCalledWith(savedPrize);
      expect(result).toEqual(savedPrize);
    });
  });

  describe('findAll', () => {
    it('should return all prizes', async () => {
      const prizes = [{ id: 1, id_sticker: 9, spins: 5 }];

      mockPrizeRepository.find.mockResolvedValue(prizes);

      const result = await service.findAll();

      expect(mockPrizeRepository.find).toHaveBeenCalledWith({
        relations: expectedRelations,
      });
      expect(result).toEqual(prizes);
    });
  });

  describe('findOne', () => {
    it('should return one prize', async () => {
      const prize = { id: 1, id_sticker: 9, spins: 5 };

      mockPrizeRepository.findOne.mockResolvedValue(prize);

      const result = await service.findOne(1);

      expect(mockPrizeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expectedRelations,
      });
      expect(result).toEqual(prize);
    });

    it('should throw NotFoundException if prize does not exist', async () => {
      mockPrizeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return prize', async () => {
      const prize = {
        id: 1,
        id_sticker: 9,
        id_packs_bronce: 1,
        id_packs_plateado: 4,
        id_packs_dorado: 7,
        spins: 5,
      };

      const updatedPrize = {
        ...prize,
        spins: 10, 
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(prize as any);
      mockPrizeRepository.save.mockResolvedValue(updatedPrize);

      const result = await service.update(1, {
        spins: 10,
      } as any);

      expect(mockPrizeRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedPrize);
    });
  });

  describe('remove', () => {
    it('should delete prize', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 1,
      } as any);

      mockPrizeRepository.delete.mockResolvedValue({
        affected: 1,
      });

      await service.remove(1);

      expect(mockPrizeRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});