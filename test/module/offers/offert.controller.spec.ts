import { Test, TestingModule } from '@nestjs/testing';

import { OffersController } from '../../../src/module/offers/offer.controller';
import { OffersService } from '../../../src/module/offers/offert.service';
import { OfferStatus } from '../../../src/module/offers/entities/offer.entity';

describe('OffersController', () => {
  let controller: OffersController;

  const mockOffersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    findByStatus: jest.fn(),
    existsActiveByUserId: jest.fn(),
    countActive: jest.fn(),
    findExpiringSoon: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffersController],
      providers: [
        {
          provide: OffersService,
          useValue: mockOffersService,
        },
      ],
    }).compile();

    controller = module.get<OffersController>(OffersController);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an offer', async () => {
      const dto = {
        offerer_user_id: 1,
        status: OfferStatus.PENDING,
      };

      const result = {
        id: 1,
        ...dto,
      };

      mockOffersService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return all offers', async () => {
      const result = [{ id: 1 }];

      mockOffersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return one offer', async () => {
      const result = { id: 1 };

      mockOffersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
    });
  });

  describe('findByUserId', () => {
    it('should return offers by user id', async () => {
      const result = [{ id: 1 }];

      mockOffersService.findByUserId.mockResolvedValue(result);

      expect(await controller.findByUserId(1)).toEqual(result);
    });
  });

  describe('findByStatus', () => {
    it('should return offers by status', async () => {
      const result = [{ id: 1 }];

      mockOffersService.findByStatus.mockResolvedValue(result);

      expect(
        await controller.findByStatus('pending'),
      ).toEqual(result);
    });
  });

  describe('existsActiveByUserId', () => {
    it('should return true if active offer exists', async () => {
      mockOffersService.existsActiveByUserId.mockResolvedValue(
        true,
      );

      expect(
        await controller.existsActiveByUserId(1),
      ).toBe(true);
    });
  });

  describe('countActive', () => {
    it('should return active count', async () => {
      mockOffersService.countActive.mockResolvedValue(5);

      expect(await controller.countActive()).toBe(5);
    });
  });

  describe('findExpiringSoon', () => {
    it('should return expiring offers', async () => {
      const result = [{ id: 1 }];

      mockOffersService.findExpiringSoon.mockResolvedValue(
        result,
      );

      expect(await controller.findExpiringSoon()).toEqual(
        result,
      );
    });
  });

  describe('update', () => {
    it('should update offer', async () => {
      const result = {
        id: 1,
        status: OfferStatus.ACCEPTED,
      };

      mockOffersService.update.mockResolvedValue(result);

      expect(
        await controller.update(1, {
          status: OfferStatus.ACCEPTED,
        } as any),
      ).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove offer', async () => {
      mockOffersService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
    });
  });
});