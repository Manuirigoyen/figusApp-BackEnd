import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LessThan } from 'typeorm';

import { OffersService } from '../../../src/module/offers/offert.service';
import { Offer, OfferStatus } from '../../../src/module/offers/entities/offer.entity';

describe('OffersService', () => {
  let service: OffersService;

  const mockOfferRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        {
          provide: getRepositoryToken(Offer),
          useValue: mockOfferRepository,
        },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an offer', async () => {
      const dto = {
        offerer_user_id: 1,
        status: OfferStatus.PENDING,
      };

      const savedOffer = {
        id: 1,
        ...dto,
      };

      mockOfferRepository.create.mockReturnValue(dto);

      mockOfferRepository.save.mockResolvedValue(savedOffer);

      const result = await service.create(dto as any);

      expect(mockOfferRepository.create).toHaveBeenCalledWith(dto);

      expect(mockOfferRepository.save).toHaveBeenCalled();

      expect(result).toEqual(savedOffer);
    });
  });

  describe('findAll', () => {
    it('should return all offers', async () => {
      const offers = [{ id: 1 }, { id: 2 }];

      mockOfferRepository.find.mockResolvedValue(offers);

      const result = await service.findAll();

      expect(mockOfferRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'offerWallet', 'exchanges'],
      });

      expect(result).toEqual(offers);
    });
  });

  describe('findOne', () => {
    it('should return one offer', async () => {
      const offer = { id: 1 };

      mockOfferRepository.findOne.mockResolvedValue(offer);

      const result = await service.findOne(1);

      expect(result).toEqual(offer);
    });

    it('should throw NotFoundException if offer does not exist', async () => {
      mockOfferRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return offers by user id', async () => {
      const offers = [{ id: 1 }];

      mockOfferRepository.find.mockResolvedValue(offers);

      const result = await service.findByUserId(1);

      expect(mockOfferRepository.find).toHaveBeenCalledWith({
        where: { offerer_user_id: 1 },
        relations: ['user', 'offerWallet', 'exchanges'],
      });

      expect(result).toEqual(offers);
    });
  });

  describe('findByStatus', () => {
    it('should return offers by status', async () => {
      const offers = [{ id: 1 }];

      mockOfferRepository.find.mockResolvedValue(offers);

      const result = await service.findByStatus(
        OfferStatus.PENDING,
      );

      expect(mockOfferRepository.find).toHaveBeenCalledWith({
        where: { status: OfferStatus.PENDING },
        relations: ['user', 'offerWallet', 'exchanges'],
      });

      expect(result).toEqual(offers);
    });
  });

  describe('countActive', () => {
    it('should return active offers count', async () => {
      mockOfferRepository.count.mockResolvedValue(5);

      const result = await service.countActive();

      expect(mockOfferRepository.count).toHaveBeenCalledWith({
        where: { status: OfferStatus.PENDING },
      });

      expect(result).toBe(5);
    });
  });

  describe('update', () => {
    it('should update and return offer', async () => {
      const offer = {
        id: 1,
        status: OfferStatus.PENDING,
      };

      const updatedOffer = {
        id: 1,
        status: OfferStatus.ACCEPTED,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(
        offer as any,
      );

      mockOfferRepository.save.mockResolvedValue(updatedOffer);

      const result = await service.update(1, {
        status: OfferStatus.ACCEPTED,
      } as any);

      expect(mockOfferRepository.save).toHaveBeenCalled();

      expect(result).toEqual(updatedOffer);
    });
  });

  describe('remove', () => {
    it('should soft delete offer', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 1,
      } as any);

      mockOfferRepository.softDelete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockOfferRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('existsActiveByUserId', () => {
    it('should return true if user has active offers', async () => {
      mockOfferRepository.count.mockResolvedValue(2);

      const result = await service.existsActiveByUserId(1);

      expect(mockOfferRepository.count).toHaveBeenCalledWith({
        where: {
          offerer_user_id: 1,
          status: OfferStatus.PENDING,
        },
      });

      expect(result).toBe(true);
    });

    it('should return false if user has no active offers', async () => {
      mockOfferRepository.count.mockResolvedValue(0);

      const result = await service.existsActiveByUserId(1);

      expect(result).toBe(false);
    });
  });

  describe('findExpiringSoon', () => {
    it('should return expiring offers', async () => {
      const offers = [{ id: 1 }];

      mockOfferRepository.find.mockResolvedValue(offers);

      const result = await service.findExpiringSoon();

      expect(mockOfferRepository.find).toHaveBeenCalledWith({
        where: {
          status: OfferStatus.PENDING,
          date_expires: expect.any(Object),
        },
        relations: ['user', 'offerWallet'],
      });

      expect(result).toEqual(offers);
    });
  });
});