import { Test, TestingModule } from '@nestjs/testing';

import { PurchasesController } from '../../../src/module/purchases/purchase.controller';
import { PurchasesService } from '../../../src/module/purchases/purchases.service';

describe('PurchasesController', () => {
  let controller: PurchasesController;

  const mockPurchasesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    findByStoreId: jest.fn(),
    countByUserId: jest.fn(),
    totalSpentByUserId: jest.fn(),
    findByDateRange: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasesController],
      providers: [
        {
          provide: PurchasesService,
          useValue: mockPurchasesService,
        },
      ],
    }).compile();

    controller = module.get<PurchasesController>(PurchasesController);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a purchase', async () => {
      const dto = {
        user_id: 1,
        store_id: 1,
        total_usd: 100,
      };

      const result = {
        id: 1,
        ...dto,
      };

      mockPurchasesService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return all purchases', async () => {
      const result = [{ id: 1 }];

      mockPurchasesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return one purchase', async () => {
      const result = { id: 1 };

      mockPurchasesService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
    });
  });

  describe('findByUserId', () => {
    it('should return purchases by user id', async () => {
      const result = [{ id: 1 }];

      mockPurchasesService.findByUserId.mockResolvedValue(result);

      expect(await controller.findByUserId(1)).toEqual(result);
    });
  });

  describe('findByStoreId', () => {
    it('should return purchases by store id', async () => {
      const result = [{ id: 1 }];

      mockPurchasesService.findByStoreId.mockResolvedValue(result);

      expect(await controller.findByStoreId(1)).toEqual(result);
    });
  });

  describe('countByUserId', () => {
    it('should return purchase count', async () => {
      mockPurchasesService.countByUserId.mockResolvedValue(5);

      expect(await controller.countByUserId(1)).toBe(5);
    });
  });

  describe('totalSpentByUserId', () => {
    it('should return total spent', async () => {
      mockPurchasesService.totalSpentByUserId.mockResolvedValue(250.5);

      expect(await controller.totalSpentByUserId(1)).toBe(250.5);
    });
  });

  describe('findByDateRange', () => {
    it('should return purchases in range', async () => {
      const result = [{ id: 1 }];

      mockPurchasesService.findByDateRange.mockResolvedValue(result);

      expect(
        await controller.findByDateRange(
          '2026-01-01',
          '2026-12-31',
        ),
      ).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update purchase', async () => {
      const result = {
        id: 1,
        total_usd: 200,
      };

      mockPurchasesService.update.mockResolvedValue(result);

      expect(
        await controller.update(1, {
          total_usd: 200,
        } as any),
      ).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove purchase', async () => {
      mockPurchasesService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
    });
  });
});