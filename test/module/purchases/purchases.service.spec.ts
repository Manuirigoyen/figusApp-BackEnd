import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Between } from 'typeorm';

import { PurchasesService } from '../../../src/module/purchases/purchases.service';
import { Purchase } from '../../../src/module/purchases/entities/purchase.entity';

describe('PurchasesService', () => {
  let service: PurchasesService;

  const mockPurchaseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: mockPurchaseRepository,
        },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a purchase', async () => {
      const dto = {
        user_id: 1,
        store_id: 1,
        total_usd: 100,
      };

      const savedPurchase = {
        id: 1,
        ...dto,
      };

      mockPurchaseRepository.create.mockReturnValue(dto);

      mockPurchaseRepository.save.mockResolvedValue(savedPurchase);

      const result = await service.create(dto as any);

      expect(mockPurchaseRepository.create).toHaveBeenCalledWith(dto);

      expect(mockPurchaseRepository.save).toHaveBeenCalled();

      expect(result).toEqual(savedPurchase);
    });
  });

  describe('findAll', () => {
    it('should return all purchases', async () => {
      const purchases = [{ id: 1 }, { id: 2 }];

      mockPurchaseRepository.find.mockResolvedValue(purchases);

      const result = await service.findAll();

      expect(mockPurchaseRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'store'],
      });

      expect(result).toEqual(purchases);
    });
  });

  describe('findOne', () => {
    it('should return one purchase', async () => {
      const purchase = { id: 1 };

      mockPurchaseRepository.findOne.mockResolvedValue(purchase);

      const result = await service.findOne(1);

      expect(result).toEqual(purchase);
    });

    it('should throw NotFoundException if purchase does not exist', async () => {
      mockPurchaseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return purchases by user id', async () => {
      const purchases = [{ id: 1 }];

      mockPurchaseRepository.find.mockResolvedValue(purchases);

      const result = await service.findByUserId(1);

      expect(mockPurchaseRepository.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['user', 'store'],
      });

      expect(result).toEqual(purchases);
    });
  });

  describe('findByStoreId', () => {
    it('should return purchases by store id', async () => {
      const purchases = [{ id: 1 }];

      mockPurchaseRepository.find.mockResolvedValue(purchases);

      const result = await service.findByStoreId(1);

      expect(mockPurchaseRepository.find).toHaveBeenCalledWith({
        where: { store_id: 1 },
        relations: ['user', 'store'],
      });

      expect(result).toEqual(purchases);
    });
  });

  describe('update', () => {
    it('should update and return purchase', async () => {
      const purchase = {
        id: 1,
        total_usd: 100,
      };

      const updatedPurchase = {
        id: 1,
        total_usd: 200,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(purchase as any);

      mockPurchaseRepository.save.mockResolvedValue(updatedPurchase);

      const result = await service.update(1, {
        total_usd: 200,
      } as any);

      expect(mockPurchaseRepository.save).toHaveBeenCalled();

      expect(result).toEqual(updatedPurchase);
    });
  });

  describe('remove', () => {
    it('should soft delete purchase', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 1,
      } as any);

      mockPurchaseRepository.softDelete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockPurchaseRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('countByUserId', () => {
    it('should return count', async () => {
      mockPurchaseRepository.count.mockResolvedValue(5);

      const result = await service.countByUserId(1);

      expect(mockPurchaseRepository.count).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });

      expect(result).toBe(5);
    });
  });

  describe('totalSpentByUserId', () => {
    it('should return total spent', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '250.5',
        }),
      };

      mockPurchaseRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.totalSpentByUserId(1);

      expect(result).toBe(250.5);
    });

    it('should return 0 if total is null', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: null,
        }),
      };

      mockPurchaseRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.totalSpentByUserId(1);

      expect(result).toBe(0);
    });
  });

  describe('findByDateRange', () => {
    it('should return purchases in date range', async () => {
      const purchases = [{ id: 1 }];

      const start = new Date('2026-01-01');
      const end = new Date('2026-12-31');

      mockPurchaseRepository.find.mockResolvedValue(purchases);

      const result = await service.findByDateRange(start, end);

      expect(mockPurchaseRepository.find).toHaveBeenCalledWith({
        where: {
          purchased_at: Between(start, end),
        },
        relations: ['user', 'store'],
      });

      expect(result).toEqual(purchases);
    });
  });
});